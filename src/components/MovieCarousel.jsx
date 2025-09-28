import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { useAuth } from '../contexts/AuthContext';
import '../styles/main.css';
import '../styles/components.css';

const MovieCarousel = ({ title, movies, genre }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const carouselRef = useRef(null);
  const { currentProfile } = useAuth();

  const scroll = (direction) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const scrollAmount = 400;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    setScrollPosition(newPosition);
    
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }

    setTimeout(() => setIsScrolling(false), 300);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current && 
    scrollPosition < (carouselRef.current.scrollWidth - carouselRef.current.clientWidth);

  return (
    <div className="movie-carousel">
      <h2 className="carousel-title">{title}</h2>
      
      <div className="carousel-container">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('left')}
              className="carousel-nav-btn left"
            >
              <ChevronLeft className="text-white" size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('right')}
              className="carousel-nav-btn right"
            >
              <ChevronRight className="text-white" size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={carouselRef}
          className="carousel-content"
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="carousel-item"
            >
              <MovieCard movie={movie} profile={currentProfile} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="carousel-progress">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ 
              width: carouselRef.current 
                ? `${(scrollPosition / (carouselRef.current.scrollWidth - carouselRef.current.clientWidth)) * 100}%` 
                : '0%' 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;