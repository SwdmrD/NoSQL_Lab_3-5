import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.get('/', reviewController.getAll);
// @ts-ignore
router.get('/:id', reviewController.getById);
router.post('/', reviewController.create);
// @ts-ignore
router.put('/:id', reviewController.update);
router.delete('/:id', reviewController.remove);

export default router;
