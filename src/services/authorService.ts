
import { Collection, ObjectId } from 'mongodb';
import { Author } from '../models/interfaces';
import { connectToDatabase } from '../db/connection';

export class AuthorService {
    private collection!: Collection<Author>;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const db = await connectToDatabase();
        this.collection = db.collection<Author>('authors');
        await this.collection.drop()
    }

    async ensureCollectionInitialized() {
        if (!this.collection) {
            await this.initialize();
        }
    }

    async create(author: Author): Promise<Author> {
        const result = await this.collection.insertOne(author);
        return { ...author, _id: result.insertedId };
    }

    async getAll(): Promise<Author[]> {
        return await this.collection.find().toArray();
    }

    async getById(id: string): Promise<Author | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByName(name: string): Promise<Author[] | null> {
        return await this.collection.find({ name }).toArray();
    }

    async getBySurname(surname: string): Promise<Author[] | null> {
        return await this.collection.find({ surname }).toArray();
    }

    async update(id: string, author: Partial<Author>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: author }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}