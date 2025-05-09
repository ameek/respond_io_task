import NoteService from '../services/note.service.js';

class NoteController {
  static async getAll(req, res) {
    try {
      const notes = await NoteService.getAllNotes(req.userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getOne(req, res) {
    try {
      const note = await NoteService.getNoteById(req.userId, req.params.id);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { title, content } = req.body;
      const note = await NoteService.createNote(req.userId, title, content);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { title, content, version } = req.body;
      const updatedNote = await NoteService.updateNote(
        req.userId,
        req.params.id,
        title,
        content,
        version
      );
      res.json(updatedNote);
    } catch (error) {
      if (error.message.includes('Conflict')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await NoteService.deleteNote(req.userId, req.params.id);
      res.json({ message: 'Note soft-deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Optional: Only include if version history is enabled
  static async revert(req, res) {
    try {
      const { version } = req.body;
      const revertedNote = await NoteService.revertToVersion(
        req.userId,
        req.params.id,
        version
      );
      res.json(revertedNote);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default NoteController;