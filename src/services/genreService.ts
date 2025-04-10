import { Collection, ObjectId } from 'mongodb';
import { Genre } from '../models/interfaces';
import { connectToDatabase } from '../db/connection';

export class GenreService {
    private collection!: Collection<Genre>;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const db = await connectToDatabase();
        this.collection = db.collection<Genre>('genres');
        await this.collection.drop()
    }

    async ensureCollectionInitialized() {
        if (!this.collection) {
            await this.initialize();
        }
    }

    async create(genre: Genre): Promise<Genre> {
        const result = await this.collection.insertOne(genre);
        return { ...genre, _id: result.insertedId };
    }

    async getAll(): Promise<Genre[]> {
        return await this.collection.find().toArray();
    }

    async getById(id: string): Promise<Genre | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByName(name: string): Promise<Genre | null> {
        return await this.collection.findOne({ name });
    }

    async update(id: string, genre: Partial<Genre>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: genre }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Агрегація для підрахунку книг за жанрами
    async getBooksCountByGenre(): Promise<any[]> {
        return await this.collection.aggregate([
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: 'genreId',
                    as: 'books'
                }
            },
            {
                $project: {
                    name: 1,
                    bookCount: { $size: '$books' }
                }
            }
        ]).toArray();
    }
}
