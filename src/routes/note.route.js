import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import NoteController from '../controllers/note.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/notes', NoteController.getAll);
router.get('/notes/:id', NoteController.getOne);
router.post('/notes', NoteController.create);
router.put('/notes/:id', NoteController.update);
router.delete('/notes/:id', NoteController.delete);

router.post('/notes/:id/revert', NoteController.revert);

export default router;