import { Router } from 'express';
import * as genreController from '../controllers/genre.controller';

const router = Router();

router.get('/', genreController.getAll);
// @ts-ignore
router.get('/:id', genreController.getById);
// @ts-ignore
router.post('/', genreController.create);
// @ts-ignore
router.put('/:id', genreController.update);
router.delete('/:id', genreController.remove);

export default router;
