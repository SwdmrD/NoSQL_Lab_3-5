import { Collection, ObjectId } from 'mongodb';
import { User } from '../models/interfaces';
import { connectToDatabase } from '../db/connection';

export class UserService {
    private collection!: Collection<User>;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const db = await connectToDatabase();
        this.collection = db.collection<User>('Users');
        await this.collection.drop()
    }

    async ensureCollectionInitialized() {
        if (!this.collection) {
            await this.initialize();
        }
    }
    async create(user: User): Promise<User> {
        const result = await this.collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    async getAll(): Promise<User[]> {
        return await this.collection.find().toArray();
    }

    async getById(id: string): Promise<User | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByUserName(userName: string): Promise<User | null> {
        await this.ensureCollectionInitialized();
        return await this.collection.findOne({ userName });
    }

    async update(id: string, User: Partial<User>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: User }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}