import { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2, X } from 'lucide-react';

export default function GenresPage() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    const API_BASE_URL = 'http://localhost:3000/api/genres';

    useEffect(() => {
        fetchGenres();
    }, []);
    const onlyLettersRegex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ\s]+$/;
    const isOnlyLetters = (str) => onlyLettersRegex.test(str.trim());

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched genres:", data);
            setGenres(data);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch genres: ${err.message}`);
            console.error("Error fetching genres:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGenreById = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(`Failed to fetch genre: ${err.message}`);
            console.error(`Error fetching genre ${id}:`, err);
            return null;
        }
    };

    const createGenre = async () => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchGenres();
            resetForm();
        } catch (err) {
            setError(`Failed to create genre: ${err.message}`);
            console.error("Error creating genre:", err);
        }
    };

    const updateGenre = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchGenres();
            resetForm();
        } catch (err) {
            setError(`Failed to update genre: ${err.message}`);
            console.error(`Error updating genre ${id}:`, err);
        }
    };

    const deleteGenre = async (id) => {
        if (!window.confirm('Are you sure you want to delete this genre?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchGenres();
        } catch (err) {
            setError(`Failed to delete genre: ${err.message}`);
            console.error(`Error deleting genre ${id}:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isOnlyLetters(formData.name)) {
            alert("Назва повинна містити лише літери!");
            return;
        }
        if (editingGenre) {
            updateGenre(editingGenre._id);
        } else {
            createGenre();
        }
    };

    const startEdit = async (id) => {
        const genre = await fetchGenreById(id);
        if (genre) {
            setEditingGenre(genre);
            setFormData({
                name: genre.name || '',
            });
            setIsFormVisible(true);
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setEditingGenre(null);
        setIsFormVisible(false);
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
        <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            <h3 className="text-3xl font-bold mb-8 text-blue-800">Genre Management</h3>

            {error && <ErrorAlert message={error} />}

            <div className="mb-6">
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                    {isFormVisible ? 'Hide Form' : 'Add Genre'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">
                        {editingGenre ? 'Edit Genre' : 'Add New Genre'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Genre Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
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
                                {editingGenre ? 'Update' : 'Create'}
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
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase">GENRE NAME</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-blue-700 uppercase">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                        <tr>
                            <td colSpan="2" className="text-center py-4 text-blue-500">Loading...</td>
                        </tr>
                    ) : genres.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="text-center py-4 text-gray-500">No genres found</td>
                        </tr>
                    ) : (
                        genres.map((genre) => (
                            <tr key={genre._id} className="hover:bg-blue-50 transition">
                                <td className="px-6 py-4">{genre.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => startEdit(genre._id)}
                                        className="text-blue-600 hover:text-blue-800 p-2 mx-1"
                                        aria-label="Edit genre"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteGenre(genre._id)}
                                        className="text-red-500 hover:text-red-700 p-2 mx-1"
                                        aria-label="Delete genre"
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