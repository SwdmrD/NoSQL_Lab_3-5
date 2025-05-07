import { Request, Response } from 'express';
import { BookService } from '../services/bookService';
import { Book } from '../models/interfaces';  // Імпортуйте модель Book або відповідну модель

const bookService = new BookService();

export const getAll = async (req: Request, res: Response) => {
    const books = await bookService.getAll();
    res.json(books);
};

export const getById = async (req: Request, res: Response) => {
    const book = await bookService.getById(req.params.id);
    if (!book) return res.status(404).json({ message: 'book not found' });
    res.json(book);
};

export const create = async (req: Request, res: Response) => {
    const created = await bookService.create(req.body);
    res.status(201).json(created);
};

export const update = async (req: Request, res: Response) => {
    const updated = await bookService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
    const result = await bookService.delete(req.params.id);
    res.json({ success: result });
};

export const getBooksWithAverageRating = async (req: Request, res: Response) => {
    const books = await bookService.getBooksWithAverageRating();
    res.json(books);
};

export const countBooksByGenre = async (req: Request, res: Response) => {
    try {
        const booksByGenre = await bookService.countBooksByGenre();
        res.json(booksByGenre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка при виконанні запиту' });
    }
};