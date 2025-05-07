import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Edit, Trash2, X, MapPin } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        location: {
            type: "Point",
            coordinates: [0, 0]
        }
    });

    // Map references
    const mapContainerId = "map-container"; // Consistent ID for map container
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:3000/api/users';

    // Load all users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle map initialization and cleanup when form visibility changes
    useEffect(() => {
        if (isFormVisible) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                initializeMap();
            }, 100);
            return () => clearTimeout(timer);
        } else {
            // Clean up map when form is hidden
            cleanupMap();
        }
    }, [isFormVisible]);

    // Update map when editing user changes
    useEffect(() => {
        if (isFormVisible && editingUser && mapInstanceRef.current) {
            updateMapPosition();
        }
    }, [editingUser, formData.location]);

    // Initialize Leaflet map
    const initializeMap = () => {
        // Clean up existing map first
        cleanupMap();

        // Make sure container exists
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) return;

        // Check if Leaflet is available
        if (typeof window.L === 'undefined') {
            loadLeafletResources(() => createMapInstance());
        } else {
            createMapInstance();
        }
    };

    // Load Leaflet resources dynamically
    const loadLeafletResources = (callback) => {
        let cssLoaded = false;
        let jsLoaded = false;

        // Check and load CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.onload = () => {
                cssLoaded = true;
                if (jsLoaded) callback();
            };
            document.head.appendChild(link);
        } else {
            cssLoaded = true;
        }

        // Check and load JS
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                jsLoaded = true;
                if (cssLoaded) callback();
            };
            document.head.appendChild(script);
        } else {
            jsLoaded = true;
            if (cssLoaded) callback();
        }
    };

    // Create the actual map instance
    const createMapInstance = () => {
        if (!window.L || mapInstanceRef.current) return;

        // Get target coordinates from form data
        const initialLat = formData.location?.coordinates?.[1] || 50.45;
        const initialLng = formData.location?.coordinates?.[0] || 30.52;

        try {
            // Create map on the container
            const map = window.L.map(mapContainerId).setView([initialLat, initialLng], 10);

            // Add OpenStreetMap tiles
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add marker at initial position
            const marker = window.L.marker([initialLat, initialLng], {
                draggable: true
            }).addTo(map);

            // Update coordinates when marker is dragged
            marker.on('dragend', (e) => {
                const position = e.target.getLatLng();
                setFormData(prev => ({
                    ...prev,
                    location: {
                        type: "Point",
                        coordinates: [position.lng, position.lat]
                    }
                }));
            });

            // Update marker and coordinates when map is clicked
            map.on('click', (e) => {
                marker.setLatLng(e.latlng);
                setFormData(prev => ({
                    ...prev,
                    location: {
                        type: "Point",
                        coordinates: [e.latlng.lng, e.latlng.lat]
                    }
                }));
            });

            // Save references
            mapInstanceRef.current = map;
            markerRef.current = marker;

            // Force a map resize after a small delay (helps with rendering issues)
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        } catch (err) {
            console.error("Error initializing map:", err);
            setError("Failed to initialize map. Please try again.");
        }
    };

    // Clean up map instance to prevent memory leaks
    const cleanupMap = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        }
    };

    // Update map position based on current form data
    const updateMapPosition = () => {
        if (!mapInstanceRef.current || !markerRef.current) return;

        try {
            const lat = formData.location?.coordinates?.[1] || 0;
            const lng = formData.location?.coordinates?.[0] || 0;

            mapInstanceRef.current.setView([lat, lng], 10);
            markerRef.current.setLatLng([lat, lng]);

            // Force map to recalculate its size
            mapInstanceRef.current.invalidateSize();
        } catch (err) {
            console.error("Error updating map position:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch users: ${err.message}`);
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserById = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(`Failed to fetch user: ${err.message}`);
            console.error(`Error fetching user ${id}:`, err);
            return null;
        }
    };

    const createUser = async () => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchUsers();
            resetForm();
        } catch (err) {
            setError(`Failed to create user: ${err.message}`);
            console.error("Error creating user:", err);
        }
    };

    const updateUser = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchUsers();
            resetForm();
        } catch (err) {
            setError(`Failed to update user: ${err.message}`);
            console.error(`Error updating user ${id}:`, err);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            await fetchUsers();
        } catch (err) {
            setError(`Failed to delete user: ${err.message}`);
            console.error(`Error deleting user ${id}:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            updateUser(editingUser._id);
        } else {
            createUser();
        }
    };

    const startEdit = async (id) => {
        // First reset form and get fresh user data
        resetFormData();

        const user = await fetchUserById(id);
        if (user) {
            setEditingUser(user);
            setFormData({
                userName: user.userName || '',
                location: user.location || {
                    type: "Point",
                    coordinates: [36.2314, 49.9915]
                }
            });

            // Show form after data is loaded
            setIsFormVisible(true);
        }
    };

    const resetFormData = () => {
        setFormData({
            userName: '',
            location: {
                type: "Point",
                coordinates:  [36.2314, 49.9915]
            }
        });
        setEditingUser(null);
    };

    const resetForm = () => {
        resetFormData();
        setIsFormVisible(false);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Update form data
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    }));

                    // Map will be updated via the useEffect that watches formData.location
                },
                (error) => {
                    setError(`Geolocation error: ${error.message}`);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser");
        }
    };

    // Format coordinates for display
    const formatCoordinates = (location) => {
        if (!location || !location.coordinates) return "No location data";

        const [lng, lat] = location.coordinates;
        return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    };

    // Show Add User form
    const showAddUserForm = () => {
        resetFormData();
        setIsFormVisible(true);
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
            <h3 className="text-3xl font-bold mb-8 text-blue-800">User Management</h3>

            {/* Error display */}
            {error && <ErrorAlert message={error} />}

            {/* Add button */}
            <div className="mb-6">
                <button
                    onClick={isFormVisible ? resetForm : showAddUserForm}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                    {isFormVisible ? 'Hide Form' : 'Add User'}
                </button>
            </div>

            {/* Form */}
            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow border border-blue-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">
                        {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Username</label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Location</label>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-700">
                                    {formatCoordinates(formData.location)}
                                </span>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition flex items-center"
                                >
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Use My Location
                                </button>
                            </div>

                            {/* Map container - Note the consistent ID */}
                            <div id={mapContainerId} className="w-full h-64 border border-blue-200 rounded-md mb-4"></div>

                            <p className="text-sm text-gray-500">
                                Click on the map or drag the marker to set location
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                {editingUser ? 'Update' : 'Create'}
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
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase border border-blue-200">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-blue-500">Loading...</td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-gray-500">No users found</td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user._id} className="hover:bg-blue-50 transition">
                                <td className="px-6 py-4">{user.userName}</td>
                                <td className="px-6 py-4">{formatCoordinates(user.location)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => startEdit(user._id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="w-5 h-5 inline" />
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user._id)}
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