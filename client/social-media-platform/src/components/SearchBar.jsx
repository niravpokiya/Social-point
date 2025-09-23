import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";

export default function SearchBar() {
    const { currentTheme } = useTheme();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length > 0) {
                searchUsers(query.trim());
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchUsers = async (searchQuery) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/user/search/${encodeURIComponent(searchQuery)}`);
            setResults(Array.isArray(res.data) ? res.data : []);
            setShowResults(true);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleResultClick = () => {
        setShowResults(false);
        setQuery("");
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text
                    }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                </div>
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div 
                    ref={resultsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto"
                    style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border
                    }}
                >
                    {results.map((user) => (
                        <Link
                            key={user._id}
                            to={`/profile/${user.username}`}
                            onClick={handleResultClick}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Avatar
                                user={user}
                                size="w-10 h-10"
                                alt={user.name}
                            />
                            <div className="flex-1">
                                <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                                    {user.name}
                                </p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                            {user.isVerified && (
                                <span className="text-blue-500">✓</span>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {showResults && query.trim().length > 0 && results.length === 0 && !loading && (
                <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 text-center"
                    style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text
                    }}
                >
                    <p>No users found for "{query}"</p>
                </div>
            )}
        </div>
    );
}
