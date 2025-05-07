import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export const getAll = async (req: Request, res: Response) => {
    const authors = await userService.getAll();
    res.json(authors);
};

export const getById = async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'user not found' });
    res.json(user);
};

export const create = async (req: Request, res: Response) => {
    const existing = await userService.getByName(req.body.userName);
    if (existing) {
        return res.status(400).json({ error: 'користувач з такою назвою вже існує' });
    }
    const created = await userService.create(req.body);
    res.status(201).json(created);
};

export const update = async (req: Request, res: Response) => {
    const existing = await userService.getByName(req.body.userName);
    if (existing) {
        return res.status(400).json({ error: 'користувач з такою назвою вже існує' });
    }
    const updated = await userService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
    const result = await userService.delete(req.params.id);
    res.json({ success: result });
};
export const findNearby = async (req: Request, res: Response) => {
    const authors = await userService.getAll();
    res.json(authors);
};