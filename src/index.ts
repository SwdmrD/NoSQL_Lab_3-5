import { connectToDatabase } from "./db/connection";
import {AuthorService} from './services/authorService';
import {BookService} from './services/bookService';
import {ReviewService} from './services/reviewService';
import {GenreService} from './services/genreService';
import {UserService} from "./services/userService";
import {ObjectId} from "mongodb";

const main = async () => {
    await connectToDatabase();
    console.log("Connected to MongoDB");

    const authorService = new AuthorService();
    const bookService = new BookService();
    const reviewService = new ReviewService();
    const genreService = new GenreService();
    const userService = new UserService();

    await Promise.all([
        authorService.ensureCollectionInitialized(),
        bookService.ensureCollectionInitialized(),
        reviewService.ensureCollectionInitialized(),
        genreService.ensureCollectionInitialized(),
        userService.ensureCollectionInitialized(),
    ]);


    // === AUTHORS ===
    const authors = [
        await authorService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1011"), name: "Ім'я 1", surname: "Ім'я 12", birthDate: new Date("1969-06-25") }),
        await authorService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1012"), name: "Ім'я 2", surname: "Ім'я 12", birthDate: new Date("1894-07-26") }),
        await authorService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1013"), name: "Ім'я 3", surname: "Ім'я 2", birthDate: new Date("2000-01-27") }),
    ];

    console.log("All Authors:", await authorService.getAll());
    console.log("One Author:", await authorService.getById("661d14f7c6c5f3095c2d1011"));
    console.log("Authors by name:", await authorService.getByName("Ім'я 1"));
    console.log("Author by surname:", await authorService.getBySurname("Ім'я 12"));
    await authorService.update("661d14f7c6c5f3095c2d1011", { name: "Ім'я 3" });
    console.log("Updated Author:", await authorService.getById("661d14f7c6c5f3095c2d1011"));
    await authorService.delete("661d14f7c6c5f3095c2d1012");

    // === GENRES ===
    const genres = [
        await genreService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1017"), name: "Жанр 1" }),
        await genreService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1018"), name: "Жанр 2" }),
        await genreService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1019"), name: "Жанр 3" }),
    ];

    console.log("All Genres:", await genreService.getAll());
    console.log("One Genre:", await genreService.getById("661d14f7c6c5f3095c2d1017"));
    console.log("Genres by name:", await genreService.getByName("Жанр 1"));
    await genreService.update("661d14f7c6c5f3095c2d1017", { name: "Жанр 4" });
    await genreService.delete("661d14f7c6c5f3095c2d1018");

    // === BOOKS ===
    const books = [
        await bookService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1020"), title: "Назва 1", authorId: new ObjectId("661d14f7c6c5f3095c2d1011"), genreId: new ObjectId("661d14f7c6c5f3095c2d1017"), publishYear: 2024 }),
        await bookService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1021"), title: "Назва 2", authorId: new ObjectId("661d14f7c6c5f3095c2d1013"), genreId: new ObjectId("661d14f7c6c5f3095c2d1019"), publishYear: 2024 }),
        await bookService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1022"), title: "Назва 3", authorId: new ObjectId("661d14f7c6c5f3095c2d1013"), genreId: new ObjectId("661d14f7c6c5f3095c2d1019"), publishYear: 2023 }),
    ];

    console.log("All Books:", await bookService.getAll());
    console.log("One Book:", await bookService.getById("661d14f7c6c5f3095c2d1020"));
    await bookService.update("661d14f7c6c5f3095c2d1020", { title: "Назва 4" });
    console.log("Updated Book:", await bookService.getById("661d14f7c6c5f3095c2d1020"));
    console.log("Books by title:", await bookService.getByTitle("Назва 3"));
    console.log("Books by author:", await bookService.getByAuthor("661d14f7c6c5f3095c2d1013"));
    console.log("Books by genre:", await bookService.getByGenre("661d14f7c6c5f3095c2d1019"));
    console.log("Books by p.y. :", await bookService.getByPublishYear(2024));
    await bookService.delete("661d14f7c6c5f3095c2d1021");

    // === USERS ===
    const users = [
        await userService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1014"), userName: "Ю 1", password: "pass1" }),
        await userService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1015"), userName: "Ю 2", password: "pass2" }),
        await userService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1016"), userName: "Ю 3", password: "pass3" }),
    ];

    console.log("All Users:", await userService.getAll());
    console.log("One User:", await userService.getById("661d14f7c6c5f3095c2d1014"));
    await userService.update("661d14f7c6c5f3095c2d1014", { userName: "Ю" });
    console.log("Updated User:", await userService.getById("661d14f7c6c5f3095c2d1014"));
    console.log("User by username:", await userService.getByUserName("Ю"));
    await userService.delete("661d14f7c6c5f3095c2d1015");

    // === REVIEWS ===
    const reviews = [
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1023"), userId: new ObjectId("661d14f7c6c5f3095c2d1014"), bookId: new ObjectId("661d14f7c6c5f3095c2d1020"), rating: 5, createdAt: new Date(), text: "Відгук 1" }),
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1024"), userId: new ObjectId("661d14f7c6c5f3095c2d1014"), bookId: new ObjectId("661d14f7c6c5f3095c2d1022"), rating: 4, createdAt: new Date(), text: "Відгук 2" }),
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1025"), userId: new ObjectId("661d14f7c6c5f3095c2d1014"), bookId: new ObjectId("661d14f7c6c5f3095c2d1020"), rating: 5, createdAt: new Date(), text: "Відгук 3" }),
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1026"), userId: new ObjectId("661d14f7c6c5f3095c2d1016"), bookId: new ObjectId("661d14f7c6c5f3095c2d1022"), rating: 2, createdAt: new Date(), text: "Відгук 4" }),
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1027"), userId: new ObjectId("661d14f7c6c5f3095c2d1016"), bookId: new ObjectId("661d14f7c6c5f3095c2d1020"), rating: 4, createdAt: new Date(), text: "Відгук 5" }),
        await reviewService.create({ _id: new ObjectId("661d14f7c6c5f3095c2d1028"), userId: new ObjectId("661d14f7c6c5f3095c2d1016"), bookId: new ObjectId("661d14f7c6c5f3095c2d1022"), rating: 5, createdAt: new Date(), text: "Відгук 6" }),
    ];

    console.log("All Reviews:", await reviewService.getAll());
    console.log("One Review:", await reviewService.getById("661d14f7c6c5f3095c2d1023"));
    await reviewService.update("661d14f7c6c5f3095c2d1023", { text: "Відгук 3" });
    console.log("Updated Review:", await reviewService.getById("661d14f7c6c5f3095c2d1023"));
    console.log("Reviews by Book:", await reviewService.getByBook("661d14f7c6c5f3095c2d1020"));
    console.log("Reviews by User:", await reviewService.getByUser("661d14f7c6c5f3095c2d1014"));
    const isAppended = await reviewService.appendTextToAllReviews(" Дякуємо за ваш відгук!");
    console.log(isAppended ? "Текст успішно додано до всіх відгуків" : "Не вдалося оновити відгуки");
    const isFormatted = await reviewService.formatReviewTexts();
    console.log(isFormatted ? "Всі відгуки відформатовано" : "Не вдалося форматувати відгуки");
    await reviewService.delete("661d14f7c6c5f3095c2d1024");
    console.log("All Reviews:", await reviewService.getAll());

    console.log("Counting books by genres:", await genreService.getBooksCountByGenre());
    console.log("Counting books by genres:", await bookService.countBooksByGenre());
    /**
     ** Різниця між countBooksByGenre у різних сервісах полягає в тому,
     * що в книгах використовується групування за жанрами,
     * а в жанрах ні.
     **/
    console.log("Books' rating:", await bookService.getBooksWithAverageRating());
};

export default main();