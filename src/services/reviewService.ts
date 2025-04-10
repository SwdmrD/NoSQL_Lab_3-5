import { Collection, ObjectId } from 'mongodb';
import {Author, Book, Review} from '../models/interfaces';
import { connectToDatabase } from '../db/connection';

export class ReviewService {
    private collection!: Collection<Review>; // Використовуємо оператор !

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const db = await connectToDatabase();
        this.collection = db.collection<Review>('reviews');
        await this.collection.drop()
    }

    async ensureCollectionInitialized() {
        if (!this.collection) {
            await this.initialize();
        }
    }

    async create(review: Review): Promise<Review> {
        const result = await this.collection.insertOne(review);
        return { ...review, _id: result.insertedId };
    }

    async getAll(): Promise<Review[]> {
        return await this.collection.find().toArray();
    }

    async getById(id: string): Promise<Review | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async getByBook(bookId: string): Promise<Review[]> {
        return await this.collection.find({ bookId: new ObjectId(bookId) }).toArray();
    }

    async getByUser(userId: string): Promise<Review[]> {
        return await this.collection.find({ userId: new ObjectId(userId) }).toArray();
    }

    async update(id: string, review: Partial<Review>): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: review }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Оновлення тексту відгуків за прикладом з методичних вказівок
    async appendTextToAllReviews(additionalText: string): Promise<boolean> {
        const result = await this.collection.updateMany(
            {},
            [
                {
                    $set: {
                        text: { $concat: ["$text", additionalText] },
                        updatedAt: new Date()
                    }
                }
            ]
        );
        return result.modifiedCount > 0;
    }

    // Форматування тексту відгуків за прикладом
    async formatReviewTexts(): Promise<boolean> {
        const result = await this.collection.updateMany(
            {},
            [
                {
                    $set: {
                        text: {
                            $ifNull: [
                                { $concat: ["Відгук: ", "$text"] },
                                "Без опису"
                            ]
                        }
                    }
                }
            ]
        );
        return result.modifiedCount > 0;
    }
}