import Note from '../models/note.js';
// import NoteVersion from '../models/NoteVersion.js'; // Optional for history tracking

class NoteService {
  /**
   * Get all active notes of user
   */
  async getAllNotes(userId) {
    return await Note.findAll({
      where: { userId, isDeleted: false },
    });
  }

  /**
   * Get note by ID and user ID
   */
  async getNoteById(userId, noteId) {
    return await Note.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });
  }

  /**
   * Create new note
   */
  async createNote(userId, title, content) {
    return await Note.create({
      userId,
      title,
      content,
    });
  }

  /**
   * Update note with optimistic locking (version check)
   */
  async updateNote(userId, noteId, title, content, version) {
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
      throw new Error('Conflict: Note was modified by another user');
    }

    return this.getNoteById(userId, noteId);
  }

  /**
   * Soft delete note
   */
  async deleteNote(userId, noteId) {
    const rowsAffected = await Note.update(
      { isDeleted: true },
      { where: { id: noteId, userId } }
    );

    if (rowsAffected[0] === 0) {
      throw new Error('Note not found or already deleted');
    }
  }

  /**
   * Revert to previous version (if version history is implemented)
   */
  async revertToVersion(userId, noteId, targetVersion) {
    return await Note.update(
      { version: targetVersion },
      { where: { id: noteId, userId } }
    );
    const oldVersion = await NoteVersion.findOne({
      where: { noteId, version: targetVersion },
    });

    if (!oldVersion) {
      throw new Error('Version not found');
    }

    await Note.update(
      {
        title: oldVersion.title,
        content: oldVersion.content,
        version: targetVersion,
      },
      { where: { id: noteId, userId } }
    );

    return this.getNoteById(userId, noteId);
  }
}

// Export singleton instance
const instance = new NoteService();
export default instance;