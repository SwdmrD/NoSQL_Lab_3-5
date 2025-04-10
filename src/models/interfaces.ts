export interface Author {
    _id?: any;
    name: string;
    surname: string;
    birthDate: Date;
}

export interface Genre {
    _id?: any;
    name: string;
}

export interface Book {
    _id?: any;
    title: string;
    authorId: any;
    genreId: any;
    publishYear: number;
}

export interface User {
    _id?: any;
    userName: string;
    password: string;
}

export interface Review {
    _id?: any;
    userId: any;
    bookId: any;
    rating: number;
    createdAt: Date;
    text: string;
}