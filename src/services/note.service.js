// import NoteVersion from '../models/NoteVersion.js'; // Optional for history tracking
import Note from '../models/note.js';

class NoteService {
  /**
   * Get all active notes of a user
   * @param {number} userId - ID of the user
   * @returns {Promise<Array>} - List of notes
   */
  async getAllNotes(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await Note.findAll({
      where: { userId, isDeleted: false },
      order: [['createdAt', 'DESC']], // Sort by latest created notes
    });
  }

  /**
   * Get a specific note by ID and user ID
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @returns {Promise<Object>} - The note object
   */
  async getNoteById(userId, noteId) {
    if (!userId || !noteId) {
      throw new Error('User ID and Note ID are required');
    }

    const note = await Note.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new Error('Note not found',note);
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
      throw new Error('User ID, title, and content are required');
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
      throw new Error('User ID, Note ID, title, content, and version are required');
    }

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
      }
    );

    if (affectedRows === 0) {
      throw new Error('Conflict: Note was modified by another user or does not exist');
    }

    return this.getNoteById(userId, noteId);
  }

  /**
   * Soft delete a note
   * @param {number} userId - ID of the user
   * @param {number} noteId - ID of the note
   * @returns {Promise<void>}
   */
  async deleteNote(userId, noteId) {
    if (!userId || !noteId) {
      throw new Error('User ID and Note ID are required');
    }

    const [rowsAffected] = await Note.update(
      { isDeleted: true },
      { where: { id: noteId, userId, isDeleted: false } }
    );

    if (rowsAffected === 0) {
      throw new Error('Note not found or already deleted');
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
      throw new Error('User ID, Note ID, and target version are required');
    }

    const note = await this.getNoteById(userId, noteId);

    if (note.version === targetVersion) {
      throw new Error('The note is already at the specified version');
    }

    // Update the note to the target version
    await Note.update(
      { version: targetVersion },
      { where: { id: noteId, userId, isDeleted: false } }
    );

    return this.getNoteById(userId, noteId);
  }
}

// Export singleton instance
const instance = new NoteService();
export default instance;