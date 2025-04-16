import { Collection, ObjectId } from 'mongodb';
import { Book } from '../models/interfaces';
import { connectToDatabase } from '../db/connection';

export class BookService {
    private collection!: Collection<Book>;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const db = await connectToDatabase();
        this.collection = db.collection<Book>('books');
        await this.collection.drop()
    }

    async ensureCollectionInitialized() {
        if (!this.collection) {
            await this.initialize();
        }
    }
    async create(book: Book): Promise<Book> {
        const result = await this.collection.insertOne(book);
        return { ...book, _id: result.insertedId };
    }

    async getAll(): Promise<Book[]> {
        return await this.collection.find().toArray();
    }

    async getById(id: string): Promise<Book | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByTitle(title: string): Promise<Book[]> {
        return await this.collection.find({
            title: { $regex: new RegExp(title, 'i') }
        }).toArray();
    }

    async getByAuthor(authorId: string): Promise<Book[]> {
        return await this.collection.find({ authorId: new ObjectId(authorId) }).toArray();
    }

    async getByGenre(genreId: string): Promise<Book[]> {
        return await this.collection.find({ genreId: new ObjectId(genreId) }).toArray();
    }

    async getByPublishYear(publishYear: number): Promise<Book[]> {
        return await this.collection.find({ publishYear }).toArray();
    }

    async update(id: string, book: Partial<Book>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: book }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    async searchBooksAnd(title: string, publishYear: number): Promise<Book[]> {
        return await this.collection.find({
            title: { $regex: new RegExp(title, 'i') },
            publishYear: publishYear
        }).toArray();
    }

    async searchBooksOr(title: string, publishYear: number): Promise<Book[]> {
        return await this.collection.find({
            $or: [
                { title: { $regex: new RegExp(title, 'i') } },
                { publishYear: publishYear }
            ]
        }).toArray();
    }

    // Агрегація даних: підрахунок книг за жанрами
    async countBooksByGenre(): Promise<any[]> {
        return await this.collection.aggregate([
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genre'
                }
            },
            { $unwind: '$genre' },
            {
                $group: {
                    _id: '$genre._id',
                    genreName: { $first: '$genre.name' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    genreId: '$_id',
                    genreName: 1,
                    count: 1
                }
            }
        ]).toArray();
    }

    // Агрегація даних: книги з рейтингом відгуків
    async getBooksWithAverageRating(): Promise<any[]> {
        return await this.collection.aggregate([
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'bookId',
                    as: 'reviews'
                }
            },
            {
                $lookup: {
                    from: 'authors',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    authorName: { $concat: ['$author.name', ' ', '$author.surname'] },
                    publishYear: 1,
                    averageRating: {
                        $cond: {
                            if: { $eq: [{ $size: '$reviews' }, 0] },
                            then: null,
                            else: { $avg: '$reviews.rating' }
                        }
                    },
                    reviewCount: { $size: '$reviews' }
                }
            }
        ]).toArray();
    }
}