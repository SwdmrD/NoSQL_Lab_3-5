import { Router } from 'express';
import * as authorController from '../controllers/author.controller';

const router = Router();

router.get('/', authorController.getAll);
router.get('/:id', authorController.getById);
router.post('/', authorController.create);
router.put('/:id', authorController.update);
router.delete('/:id', authorController.remove);

export default router;