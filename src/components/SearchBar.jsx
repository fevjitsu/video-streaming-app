import React, { useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies } from '../services/tmdbAPI';
import '../styles/navbar.css';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when component mounts
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = (searchQuery) => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (movie) => {
    console.log('Movie selected:', movie);
    setQuery('');
    setResults([]);
    if (onClose) onClose();
  };

  const filteredResults = useMemo(() => {
    return results.slice(0, 5);
  }, [results]);

  return (
    <div className="search-bar-wrapper">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Titles, people, genres..."
          className="search-input"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="search-clear"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="search-results-dropdown"
          >
            {isLoading ? (
              <div className="search-loading">
                <div className="search-spinner"></div>
                <span>Searching...</span>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                {filteredResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="search-result-item"
                    onClick={() => handleResultClick(movie)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="search-result-poster"
                    />
                    <div className="search-result-info">
                      <div className="search-result-title">{movie.title}</div>
                      <div className="search-result-year">
                        {new Date(movie.release_date).getFullYear()}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="search-footer">
                  <button className="view-all-results">
                    View all results for "{query}"
                  </button>
                </div>
              </>
            ) : (
              <div className="search-no-results">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;