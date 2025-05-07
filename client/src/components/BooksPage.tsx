import { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2, X } from 'lucide-react';

interface GenreCount {
    genreId: string;
    genreName: string;
    count: number;
}
interface BookWithRating {
    bookId: string;
    title: string;
    publishYear: number | string;
    authorName: string;
    averageRating: number | null;
    reviewCount: number;
}

export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countGenres, setCountGenres] = useState<GenreCount[]>([]);
    const [averageRating, setAverageRating] = useState<BookWithRating[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        authorId: '',
        genreId: '',
        publishYear: new Date().getFullYear(),
    });

    const API_BASE_URL = 'http://localhost:3000/api/books';
    const AUTHORS_API_URL = 'http://localhost:3000/api/authors';
    const GENRES_API_URL = 'http://localhost:3000/api/genres';

    useEffect(() => {
        fetchBooks();
        fetchAuthors();
        fetchGenres();
        fetchCountBooksByGenre();
        fetchAverageRating();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched books:", data);
            setBooks(data);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch books: ${err.message}`);
            console.error("Error fetching books:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await fetch(AUTHORS_API_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setAuthors(data);
        } catch (err) {
            setError(`Failed to fetch authors: ${err.message}`);
            console.error("Error fetching authors:", err);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await fetch(GENRES_API_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setGenres(data);
        } catch (err) {
            setError(`Failed to fetch genres: ${err.message}`);
            console.error("Error fetching genres:", err);
        }
    };

    const fetchBookById = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(`Failed to fetch book: ${err.message}`);
            console.error(`Error fetching book ${id}:`, err);
            return null;
        }
    };

    const createBook = async () => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchBooks();
            await fetchCountBooksByGenre();
            resetForm();
        } catch (err) {
            setError(`Failed to create book: ${err.message}`);
            console.error("Error creating book:", err);
        }
    };

    const updateBook = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchBooks();
            await fetchCountBooksByGenre();
            resetForm();
        } catch (err) {
            setError(`Failed to update book: ${err.message}`);
            console.error(`Error updating book ${id}:`, err);
        }
    };

    const deleteBook = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchBooks();
            await fetchCountBooksByGenre();
        } catch (err) {
            setError(`Failed to delete book: ${err.message}`);
            console.error(`Error deleting book ${id}:`, err);
        }
    };

    const fetchCountBooksByGenre = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/books/count-by-genre');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setCountGenres(data);
        } catch (err) {
            setError(`Failed to fetch genres count: ${err.message}`);
            console.error("Error fetching genres count:", err);
        }
    };

    const fetchAverageRating = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/books/average-rating');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setAverageRating(data);
        } catch (err) {
            setError(`Failed to fetch average ratings: ${err.message}`);
            console.error("Error fetching average ratings:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBook) {
            updateBook(editingBook._id);
        } else {
            createBook();
        }
    };

    const startEdit = async (id) => {
        const book = await fetchBookById(id);
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title || '',
                authorId: book.authorId || '',
                genreId: book.genreId || '',
                publishYear: book.publishYear || new Date().getFullYear(),
            });
            setIsFormVisible(true);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            authorId: '',
            genreId: '',
            publishYear: new Date().getFullYear(),
        });
        setEditingBook(null);
        setIsFormVisible(false);
    };

    const getAuthorName = (authorId) => {
        const author = authors.find(author => author._id === authorId);
        return author ? author.name : 'Unknown Author';
    };

    const getGenreName = (genreId) => {
        const genre = genres.find(genre => genre._id === genreId);
        return genre ? genre.name : 'Unknown Genre';
    };

    const ErrorAlert = ({ message }) => (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{message}</span>
            <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            <h3 className="text-3xl font-bold mb-8 text-blue-800">Book Management</h3>

            {error && <ErrorAlert message={error} />}

            <div className="mb-6">
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                    {isFormVisible ? 'Hide Form' : 'Add Book'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">
                        {editingBook ? 'Edit Book' : 'Add New Book'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Book Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Author</label>
                            <select
                                name="authorId"
                                value={formData.authorId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select an author</option>
                                {authors.map(author => (
                                    <option key={author._id} value={author._id}>
                                        {author.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Genre</label>
                            <select
                                name="genreId"
                                value={formData.genreId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select a genre</option>
                                {genres.map(genre => (
                                    <option key={genre._id} value={genre._id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Publication Year</label>
                            <input
                                type="number"
                                name="publishYear"
                                value={formData.publishYear}
                                onChange={handleChange}
                                min="1000"
                                max={new Date().getFullYear() + 5}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                {editingBook ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-blue-200">
                    <thead className="bg-blue-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">TITLE</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">AUTHOR</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">GENRE</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">PUBLISHED</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-blue-700 uppercase">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-blue-500">Loading...</td>
                        </tr>
                    ) : books.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">No books found</td>
                        </tr>
                    ) : (
                        books.map((book) => (
                            <tr key={book._id} className="hover:bg-blue-50 transition">
                                <td className="px-6 py-4">{book.title}</td>
                                <td className="px-6 py-4">{getAuthorName(book.authorId)}</td>
                                <td className="px-6 py-4">{getGenreName(book.genreId)}</td>
                                <td className="px-6 py-4">{book.publishYear}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => startEdit(book._id)}
                                        className="text-blue-600 hover:text-blue-800 p-2 mx-1"
                                        aria-label="Edit book"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteBook(book._id)}
                                        className="text-red-500 hover:text-red-700 p-2 mx-1"
                                        aria-label="Delete book"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="bg-white mt-8 p-7 rounded-xl shadow border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Кількість книг за жанрами</h2>
                {countGenres.length === 0 ? (
                    <p className="text-gray-500">Дані завантажуються...</p>
                ) : (
                    <ul className="space-y-2">
                        {countGenres.map((genre) => (
                            <li key={genre.genreId} className="flex justify-between border-b border-blue-100 pb-2">
                                <span>{genre.genreName}</span>
                                <strong>{genre.count} од.</strong>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white mt-8 p-7 rounded-xl shadow border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Середній рейтинг книг</h2>
                {averageRating.length === 0 ? (
                    <p className="text-gray-500">Дані завантажуються...</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {averageRating.map((book) => (
                            <div key={book.bookId} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition">
                                <h3 className="font-medium text-blue-600 mb-2">{book.title}</h3>
                                <p className="text-sm text-gray-600">Автор: {book.authorName}</p>
                                <p className="text-sm text-gray-600">Рік видання: {book.publishYear}</p>
                                {book.reviewCount === 0 || book.averageRating === null ? (
                                    <p className="text-sm text-gray-500 mt-2">Немає оцінок</p>
                                ) : (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">
                                            Середня оцінка: <span className="font-bold text-blue-700">{book.averageRating.toFixed(1)}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Кількість рецензій: {book.reviewCount}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}