import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ThumbsUp, ThumbsDown, Plus, Info } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import '../styles/main.css';
import '../styles/components.css';

const MovieCard = ({ movie, profile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const { currentUser } = useAuth();

  const handleHoverStart = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      setShowTrailer(true);
    }, 500);
  };

  const handleHoverEnd = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setShowTrailer(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  const handleInteraction = async (type) => {
    if (!currentUser || !profile) return;

    const userProfileRef = doc(db, 'users', currentUser.uid, 'profiles', profile.id);
    
    if (type === 'like') {
      await updateDoc(userProfileRef, {
        likedMovies: arrayUnion(movie.id),
        dislikedMovies: arrayRemove(movie.id)
      });
    } else if (type === 'dislike') {
      await updateDoc(userProfileRef, {
        dislikedMovies: arrayUnion(movie.id),
        likedMovies: arrayRemove(movie.id)
      });
    }
  };

  const isLiked = profile?.likedMovies?.includes(movie.id);
  const isDisliked = profile?.dislikedMovies?.includes(movie.id);

  return (
    <motion.div
      className="movie-card"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      layout
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="movie-poster"
      />

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="movie-hover-overlay"
        >
          {showTrailer && movie.trailer_url && (
            <video
              ref={videoRef}
              src={movie.trailer_url}
              autoPlay
              muted
              loop
              className="trailer-video"
            />
          )}

          <div className="movie-actions">
            <button className="action-button primary">
              <Play size={20} fill="currentColor" />
            </button>
            <button className="action-button secondary">
              <Plus size={20} />
            </button>
            <button 
              className={`action-button ${isLiked ? 'liked' : 'secondary'}`}
              onClick={() => handleInteraction('like')}
            >
              <ThumbsUp size={20} />
            </button>
            <button 
              className={`action-button ${isDisliked ? 'disliked' : 'secondary'}`}
              onClick={() => handleInteraction('dislike')}
            >
              <ThumbsDown size={20} />
            </button>
          </div>

          <div className="movie-info">
            <h3>{movie.title}</h3>
            <div className="movie-meta">
              <span className="match-rating">{movie.match}% Match</span>
              <span>{movie.release_date?.split('-')[0]}</span>
              <span className="quality-badge">HD</span>
            </div>
            <div className="genre-tags">
              {movie.genres?.map(genre => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MovieCard;