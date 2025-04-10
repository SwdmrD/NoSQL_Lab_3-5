import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
    if (db) return db;

    try {
        const client = await MongoClient.connect('mongodb://localhost:27017');
        db = client.db('book_reviews');
        console.log('Connected to MongoDB successfully');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}