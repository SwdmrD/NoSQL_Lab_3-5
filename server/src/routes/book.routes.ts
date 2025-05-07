import { Router } from 'express';
import * as bookController from '../controllers/book.controller';

const router = Router();

router.get('/', bookController.getAll);
router.get('/average-rating', bookController.getBooksWithAverageRating);
router.get('/count-by-genre', bookController.countBooksByGenre);
// @ts-ignore
router.get('/:id', bookController.getById);
router.post('/', bookController.create);
// @ts-ignore
router.put('/:id', bookController.update);
router.delete('/:id', bookController.remove);


export default router;
