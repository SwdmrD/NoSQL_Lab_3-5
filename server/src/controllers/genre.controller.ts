import { Request, Response } from 'express';
import { GenreService } from '../services/genreService';

const genreService = new GenreService();

export const getAll = async (req: Request, res: Response) => {
    const genres = await genreService.getAll();
    res.json(genres);
};

export const getById = async (req: Request, res: Response) => {
    const genre = await genreService.getById(req.params.id);
    if (!genre) return res.status(404).json({ message: 'genre not found' });
    res.json(genre);
};

export const create = async (req: Request, res: Response) => {
    const { name } = req.body;

    const existing = await genreService.getByName(name);
    if (existing) {
        return res.status(400).json({ error: 'Жанр з такою назвою вже існує' });
    }
    const created = await genreService.create(req.body);
    res.status(201).json(created);
};

export const update = async (req: Request, res: Response) => {
    const existing = await genreService.getByName(req.body.name);
    if (existing) {
        return res.status(400).json({ error: 'Жанр з такою назвою вже існує' });
    }
    const updated = await genreService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
    const result = await genreService.delete(req.params.id);
    res.json({ success: result });
};
