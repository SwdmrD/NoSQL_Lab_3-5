import { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2, X, Star, StarHalf } from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        bookId: '',
        rating: 5,
        text: '',
    });

    const API_BASE_URL = 'http://localhost:3000/api/reviews';
    const USERS_API_URL = 'http://localhost:3000/api/users';
    const BOOKS_API_URL = 'http://localhost:3000/api/books';

    useEffect(() => {
        fetchReviews();
        fetchUsers();
        fetchBooks();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched reviews:", data);
            setReviews(data);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch reviews: ${err.message}`);
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(USERS_API_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(`Failed to fetch users: ${err.message}`);
            console.error("Error fetching users:", err);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await fetch(BOOKS_API_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            setError(`Failed to fetch books: ${err.message}`);
            console.error("Error fetching books:", err);
        }
    };

    const fetchReviewById = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(`Failed to fetch review: ${err.message}`);
            console.error(`Error fetching review ${id}:`, err);
            return null;
        }
    };

    const createReview = async () => {
        try {
            const reviewData = {
                ...formData,
                createdAt: new Date().toISOString()
            };

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchReviews();
            resetForm();
        } catch (err) {
            setError(`Failed to create review: ${err.message}`);
            console.error("Error creating review:", err);
        }
    };

    const updateReview = async (id) => {
        try {
            console.log("Updating review with ID:", id);
            const response = await fetch(`http://localhost:3000/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchReviews();
            resetForm();
        } catch (err) {
            setError(`Failed to update review: ${err.message}`);
            console.error(`Error updating review ${id}:`, err);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchReviews();
        } catch (err) {
            setError(`Failed to delete review: ${err.message}`);
            console.error(`Error deleting review ${id}:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingReview) {
            updateReview(editingReview._id);
        } else {
            createReview();
        }
    };

    const startEdit = async (id) => {
        const review = await fetchReviewById(id);
        if (review) {
            setEditingReview(review);
            setFormData({
                userId: review.userId || '',
                bookId: review.bookId || '',
                rating: review.rating || 5,
                text: review.text || '',
            });
            setIsFormVisible(true);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            bookId: '',
            rating: 5,
            text: '',
        });
        setEditingReview(null);
        setIsFormVisible(false);
    };

    const getUserName = (userId) => {
        const user = users.find(user => user._id === userId);
        return user ? user.userName : 'Unknown User';
    };

    const getBookTitle = (bookId) => {
        const book = books.find(book => book._id === bookId);
        return book ? book.title : 'Unknown Book';
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`star-${i}`} className="w-4 h-4 text-yellow-500 inline" fill="currentColor" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half-star" className="w-4 h-4 text-yellow-500 inline" fill="currentColor" />);
        }

        return (
            <div className="flex items-center">
                <span className="mr-1">{rating}</span>
                <div className="flex">{stars}</div>
            </div>
        );
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
            <h3 className="text-3xl font-bold mb-8 text-blue-800">Review Management</h3>

            {error && <ErrorAlert message={error} />}

            <div className="mb-6">
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                    {isFormVisible ? 'Hide Form' : 'Add Review'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">
                        {editingReview ? 'Edit Review' : 'Add New Review'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">User</label>
                            <select
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select a user</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.userName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Book</label>
                            <select
                                name="bookId"
                                value={formData.bookId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select a book</option>
                                {books.map(book => (
                                    <option key={book._id} value={book._id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Rating</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                min="1"
                                max="5"
                                step="0.5"
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Review Text</label>
                            <textarea
                                name="text"
                                value={formData.text}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                {editingReview ? 'Update' : 'Create'}
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
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">USER</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">BOOK</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">RATING</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">DATE</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">REVIEW</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-blue-700 uppercase">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-blue-500">Loading...</td>
                        </tr>
                    ) : reviews.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-gray-500">No reviews found</td>
                        </tr>
                    ) : (
                        reviews.map((review) => (
                            <tr key={review._id} className="hover:bg-blue-50 transition">
                                <td className="px-6 py-4">{getUserName(review.userId)}</td>
                                <td className="px-6 py-4">{getBookTitle(review.bookId)}</td>
                                <td className="px-6 py-4">{renderStars(review.rating)}</td>
                                <td className="px-6 py-4">{formatDate(review.createdAt)}</td>
                                <td className="px-6 py-4">{truncateText(review.text)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => startEdit(review._id)}
                                        className="text-blue-600 hover:text-blue-800 p-2 mx-1"
                                        aria-label="Edit review"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteReview(review._id)}
                                        className="text-red-500 hover:text-red-700 p-2 mx-1"
                                        aria-label="Delete review"
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
        </div>
    );
}