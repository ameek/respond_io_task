import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import NoteController from '../controllers/note.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', NoteController.getAll);
router.get('/:id', NoteController.getOne);
router.post('/', NoteController.create);
router.put('/:id', NoteController.update);
router.delete('/:id', NoteController.delete);

router.post('/:id/revert', NoteController.revert);

export default router;