import { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2, X } from 'lucide-react';

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
    });

    // API base URL - make sure this matches your backend URL
    const API_BASE_URL = 'http://localhost:3000/api/authors';

    // Load all authors
    useEffect(() => {
        fetchAuthors();
    }, []);
    const onlyLettersRegex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ\s]+$/;
    const isOnlyLetters = (str) => onlyLettersRegex.test(str.trim());

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setAuthors(data);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch authors: ${err.message}`);
            console.error("Error fetching authors:", err);
        } finally {
            setLoading(false);
        }
    };

    // Get author by ID
    const fetchAuthorById = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(`Failed to fetch author: ${err.message}`);
            console.error(`Error fetching author ${id}:`, err);
            return null;
        }
    };

    // Create a new author
    const createAuthor = async () => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchAuthors();
            resetForm();
        } catch (err) {
            setError(`Failed to create author: ${err.message}`);
            console.error("Error creating author:", err);
        }
    };

    // Update author
    const updateAuthor = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchAuthors();
            resetForm();
        } catch (err) {
            setError(`Failed to update author: ${err.message}`);
            console.error(`Error updating author ${id}:`, err);
        }
    };

    // Delete author
    const deleteAuthor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this author?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchAuthors();
        } catch (err) {
            setError(`Failed to delete author: ${err.message}`);
            console.error(`Error deleting author ${id}:`, err);
        }
    };

    // Form handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isOnlyLetters(formData.name) || !isOnlyLetters(formData.surname)) {
            alert("Ім'я та прізвище повинні містити лише літери!");
            return;
        }
        if (editingAuthor) {
            updateAuthor(editingAuthor._id);
        } else {
            createAuthor();
        }
    };

    const startEdit = async (id) => {
        const author = await fetchAuthorById(id);
        if (author) {
            setEditingAuthor(author);
            setFormData({
                name: author.name || '',
                surname: author.surname || '',
            });
            setIsFormVisible(true);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', surname: '' });
        setEditingAuthor(null);
        setIsFormVisible(false);
    };

    // Error display component
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
        <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen rounded-lg shadow-md">
            <h3 className="text-3xl font-bold mb-8 text-blue-800">Author Management</h3>

            {/* Error display */}
            {error && <ErrorAlert message={error} />}

            {/* Add button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                    {isFormVisible ? 'Hide Form' : 'Add Author'}
                </button>
            </div>

            {/* Form */}
            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">
                        {editingAuthor ? 'Edit Author' : 'Add New Author'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                {editingAuthor ? 'Update' : 'Create'}
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

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-blue-200 border border-blue-300">
                    <thead className="bg-blue-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Surname</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-blue-500">Loading...</td>
                        </tr>
                    ) : authors.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-gray-500">No authors found</td>
                        </tr>
                    ) : (
                        authors.map((author) => (
                            <tr key={author._id} className="hover:bg-blue-50 transition">
                                <td className="px-6 py-4">{author.name}</td>
                                <td className="px-6 py-4">{author.surname}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => startEdit(author._id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="w-5 h-5 inline" />
                                    </button>
                                    <button
                                        onClick={() => deleteAuthor(author._id)}
                                        className="text-red-500 hover:text-red-700 bg-blue-100 hover:bg-blue-200 rounded px-2 py-1"
                                    >
                                        <Trash2 className="w-5 h-5 inline" />
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