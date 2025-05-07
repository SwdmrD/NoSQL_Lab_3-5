import { Request, Response } from 'express';
import { AuthorService } from '../services/authorService';

const authorService = new AuthorService();

// Ensure the collection is initialized before handling requests
authorService.ensureCollectionInitialized().catch(err => console.error('Failed to initialize author service:', err));

export const getAll = async (req: Request, res: Response) => {
    try {
        await authorService.ensureCollectionInitialized();
        const authors = await authorService.getAll();
        return res.json(authors);
    } catch (error) {
        console.error('Error in getAll:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        await authorService.ensureCollectionInitialized();
        const author = await authorService.getById(req.params.id);
        if (!author) return res.status(404).json({ message: 'Author not found' });
        return res.json(author);
    } catch (error) {
        console.error('Error in getById:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        await authorService.ensureCollectionInitialized();
        const created = await authorService.create(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error('Error in create:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        await authorService.ensureCollectionInitialized();
        const updated = await authorService.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Author not found' });
        return res.json({ success: updated });
    } catch (error) {
        console.error('Error in update:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        await authorService.ensureCollectionInitialized();
        const result = await authorService.delete(req.params.id);
        return res.json({ success: result });
    } catch (error) {
        console.error('Error in remove:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};