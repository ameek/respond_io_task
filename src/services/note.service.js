import NoteVersion from "../models/NoteVersion.js";
import Note from "../models/note.js";
import redisClient from "../config/redis.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

class NoteService {
  /**
   * Get a specific note by ID and user ID
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @returns {Promise<Object>} - The note object
   */
  async getNoteById(userId, noteId) {
    if (!userId || !noteId) {
      throw new Error("User ID and Note ID are required");
    }

    const note = await Note.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new Error("Note not found");
    }
    const response = {
      id: note.id,
      title: note.title,
      content: note.content,
      version: note.version,
      updatedAt: note.updatedAt,
    };

    return response;
  }

  /**
   * Create a new note
   * @param {number} userId - ID of the user
   * @param {string} title - Title of the note
   * @param {string} content - Content of the note
   * @returns {Promise<Object>} - The created note
   */
  async createNote(userId, title, content) {
    if (!userId || !title || !content) {
      throw new Error("User ID, title, and content are required");
    }

    const note = await Note.create({
      userId,
      title,
      content,
      version: 1,
    });

    return note;
  }

  /**
   * Update a note with optimistic locking (version check)
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @param {string} title - Updated title
   * @param {string} content - Updated content
   * @param {number} version - Current version of the note
   * @returns {Promise<Object>} - The updated note
   */
  async updateNote(userId, noteId, title, content, version) {
    if (!userId || !noteId || !title || !content || version === undefined) {
      throw new Error(
        "User ID, Note ID, title, content, and version are required"
      );
    }

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      const note = await Note.findOne({
        where: { id: noteId, userId, version, isDeleted: false },
        transaction,
      });

      if (!note) {
        throw new Error(
          "Conflict: Note was modified by another user or does not exist"
        );
      }
      // check no duplicate entries in NoteVersion
      const existingVersion = await NoteVersion.findOne({
        where: { noteId: note.id, version: note.version },
        transaction,
      });

      if (!existingVersion) {
        await NoteVersion.create(
          {
            noteId: note.id,
            userId: note.userId,
            title: note.title,
            content: note.content,
            version: note.version,
          },
          { transaction }
        );
      } else {
        await NoteVersion.update(
          {
            title: note.title,
            content: note.content,
            version: note.version,
          },
          { where: { noteId: note.id, version: note.version } },
          { transaction }
        );
      }

      // Update the note with the new content and increment the version
      const [affectedRows] = await Note.update(
        {
          title,
          content,
          version: version + 1,
        },
        {
          where: {
            id: noteId,
            userId,
            version,
            isDeleted: false,
          },
          transaction,
        }
      );

      if (affectedRows === 0) {
        throw new Error(
          "Conflict: Note was modified by another user or does not exist"
        );
      }

      // Commit the transaction
      await transaction.commit();

      // Invalidate the cache for the user's notes
      await this.invalidateCache(userId);

      // Return the updated note
      return this.getNoteById(userId, noteId);
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Soft delete a note
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @returns {Promise<void>}
   */
  async deleteNote(userId, noteId) {
    if (!userId || !noteId) {
      throw new Error("User ID and Note ID are required");
    }

    const [rowsAffected] = await Note.update(
      { isDeleted: true },
      { where: { id: noteId, userId, isDeleted: false } }
    );

    if (rowsAffected === 0) {
      throw new Error("Note not found or already deleted");
    }
  }

  /**
   * Revert a note to a previous version (if version history is implemented)
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @param {number} targetVersion - Version to revert to
   * @returns {Promise<Object>} - The reverted note
   */
  async revertToVersion(userId, noteId, targetVersion) {
    if (!userId || !noteId || !targetVersion) {
      throw new Error("User ID, Note ID, and target version are required");
    }

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Fetch the current note
      const note = await Note.findOne({
        where: { id: noteId, userId, isDeleted: false },
        transaction,
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.version === targetVersion) {
        throw new Error("The note is already at the specified version");
      }

      // getting the latest entry for the target version
      const targetNote = await NoteVersion.findOne({
        where: { noteId, userId, version: targetVersion },
        order: [["createdAt", "DESC"]], // Get the latest entry
        transaction,
      });

      if (!targetNote) {
        throw new Error("Target version not found");
      }

      // Update the note's content and title to the target version
      await Note.update(
        {
          title: targetNote.title,
          content: targetNote.content,
          version: targetVersion,
        },
        {
          where: { id: noteId, userId, isDeleted: false },
          transaction,
        }
      );

      // Commit the transaction
      await transaction.commit();

      // Invalidate the cache for the user's notes
      await this.invalidateCache(userId);

      // Return the updated note
      return this.getNoteById(userId, noteId);
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      throw error;
    }
  }

  //search notes with full-text search
  /**
   * Search notes by keyword in title or content
   * @param {number} userId - ID of the user
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<Array>} - List of matching notes
   */
  async searchNotes(userId, keyword) {
    if (!userId || !keyword) {
      throw new Error("User ID and keyword are required");
    }

    const notes = await Note.findAll({
      where: {
        userId,
        isDeleted: false,
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    if (!notes) {
      throw new Error("No notes found");
    }
    return notes;
  }

  //caching the frequently used notes
  /**
   * Get all notes of a user with caching
   * @param {number} userId - ID of the user
   * @returns {Promise<Array>} - List of notes
   */
  async getAllNotes(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const cacheKey = `notes:${userId}`;
    const cachedNotes = await redisClient.get(cacheKey);

    if (cachedNotes) {
      return JSON.parse(cachedNotes);
    }

    const notes = await Note.findAll({
      where: { userId, isDeleted: false },
      order: [["createdAt", "DESC"]],
    });

    await redisClient.set(cacheKey, JSON.stringify(notes), { EX: 3600 }); // Cache for 1 hour
    return notes;
  }

  async invalidateCache(userId) {
    const cacheKey = `notes:${userId}`;
    await redisClient.del(cacheKey);
  }
}

// Export singleton instance
const instance = new NoteService();
export default instance;
