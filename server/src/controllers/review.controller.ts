import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';

const reviewService = new ReviewService();

export const getAll = async (req: Request, res: Response) => {
    const authors = await reviewService.getAll();
    res.json(authors);
};

export const getById = async (req: Request, res: Response) => {
    const review = await reviewService.getById(req.params.id);
    if (!review) return res.status(404).json({ message: 'review not found' });
    res.json(review);
};

export const create = async (req: Request, res: Response) => {
    const created = await reviewService.create(req.body);
    res.status(201).json(created);
};

export const update = async (req: Request, res: Response) => {
    const updated = await reviewService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
    const result = await reviewService.delete(req.params.id);
    res.json({ success: result });
};
