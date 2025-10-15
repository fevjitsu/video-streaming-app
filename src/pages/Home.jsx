import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MovieCarousel from '../components/MovieCarousel';
import Navbar from '../components/Navbar';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { getFeaturedContent, getMoviesByGenre } from '../services/tmdbAPI';
import '../styles/home.css';

const Home = () => {
  const { currentUser, currentProfile, hasActiveSubscription } = useAuth();
  const [featuredContent, setFeaturedContent] = useState(null);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(!currentProfile);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Load featured content and movies by genre
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Load featured content
        const featured = await getFeaturedContent();
        setFeaturedContent(featured);
        
        // Load movies by genre
        const genres = ['action', 'comedy', 'drama', 'horror', 'documentary'];
        const genrePromises = genres.map(genre => getMoviesByGenre(genre));
        const genreResults = await Promise.all(genrePromises);
        
        const moviesData = {};
        genres.forEach((genre, index) => {
          moviesData[genre] = genreResults[index];
        });
        
        setMoviesByGenre(moviesData);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Handle video play/pause
  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Handle video mute/unmute
  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Show video controls on mouse move
  const handleMouseMove = () => {
    setShowVideoControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowVideoControls(false);
    }, 3000);
  };

  // Enter fullscreen
  const enterFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  // Featured content background with fallback
  const getFeaturedBackground = () => {
    if (!featuredContent) return '';
    
    if (featuredContent.backdrop_path) {
      return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/original${featuredContent.backdrop_path})`;
    }
    
    return `linear-gradient(135deg, ${featuredContent.gradient || '#0c4a6e, #1e40af'})`;
  };

  if (showProfileSwitcher && currentUser) {
    return (
      <div className="home-container">
        <ProfileSwitcher 
          onProfileSelect={() => setShowProfileSwitcher(false)}
          onProfileCreate={() => setShowProfileSwitcher(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing stuff..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar />
      
      {/* Featured Content Section */}
      <section 
        className="featured-section"
        style={{ backgroundImage: getFeaturedBackground() }}
        onMouseMove={handleMouseMove}
      >
        <div className="featured-overlay">
          <div className="featured-content">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="featured-info"
            >
              <h1 className="featured-title">
                {featuredContent?.title || featuredContent?.name}
              </h1>
              
              <div className="featured-meta">
                <span className="match-badge">{featuredContent?.vote_average * 10}% Match</span>
                <span className="year">{new Date(featuredContent?.release_date).getFullYear()}</span>
                <span className="quality">HD</span>
                <span className="maturity-rating">PG-13</span>
              </div>
              
              <p className="featured-description">
                {featuredContent?.overview}
              </p>
              
              <div className="featured-actions">
                <button 
                  className="play-button"
                  onClick={toggleVideoPlayback}
                >
                  <Play size={24} fill="currentColor" />
                  {isVideoPlaying ? 'Pause' : 'Play'}
                </button>
                
                <button className="more-info-button">
                  <Info size={24} />
                  More Info
                </button>
              </div>
            </motion.div>

            {/* Featured Video */}
            {featuredContent?.video_url && (
              <div className="featured-video-container">
                <video
                  ref={videoRef}
                  src={featuredContent.video_url}
                  muted={isVideoMuted}
                  loop
                  className="featured-video"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                
                <AnimatePresence>
                  {showVideoControls && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="video-controls"
                    >
                      <div className="controls-left">
                        <button 
                          className="control-button"
                          onClick={toggleVideoPlayback}
                        >
                          {isVideoPlaying ? '❚❚' : '▶'}
                        </button>
                        
                        <button 
                          className="control-button"
                          onClick={toggleVideoMute}
                        >
                          {isVideoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        
                        <div className="volume-slider">
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            className="volume-range"
                          />
                        </div>
                      </div>
                      
                      <div className="controls-right">
                        <button 
                          className="control-button"
                          onClick={enterFullscreen}
                        >
                          <Maximize size={20} />
                        </button>
                        
                        <button className="control-button">
                          <Settings size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="bottom-gradient"></div>
      </section>

      {/* Movie Carousels Section */}
      <section className="carousels-section">
        <div className="container">
          {/* Trending Now */}
          {moviesByGenre.action && (
            <MovieCarousel
              title="Trending Now"
              movies={moviesByGenre.action.slice(0, 10)}
              genre="action"
            />
          )}
          
          {/* Popular on Netflix */}
          {moviesByGenre.drama && (
            <MovieCarousel
              title="Popular on Netflix"
              movies={moviesByGenre.drama.slice(0, 10)}
              genre="drama"
            />
          )}
          
          {/* Comedy */}
          {moviesByGenre.comedy && (
            <MovieCarousel
              title="Comedies"
              movies={moviesByGenre.comedy.slice(0, 10)}
              genre="comedy"
            />
          )}
          
          {/* Horror */}
          {moviesByGenre.horror && (
            <MovieCarousel
              title="Horror Movies"
              movies={moviesByGenre.horror.slice(0, 10)}
              genre="horror"
            />
          )}
          
          {/* Documentaries */}
          {moviesByGenre.documentary && (
            <MovieCarousel
              title="Documentaries"
              movies={moviesByGenre.documentary.slice(0, 10)}
              genre="documentary"
            />
          )}
          
          {/* Because you liked... */}
          {currentProfile?.likedMovies && currentProfile.likedMovies.length > 0 && (
            <MovieCarousel
              title="Because you liked..."
              movies={moviesByGenre.action?.slice(0, 8) || []}
              genre="recommendations"
            />
          )}
        </div>
      </section>

      {/* Subscription Banner for non-subscribers */}
      {!hasActiveSubscription() && (
        <section className="subscription-banner">
          <div className="container">
            <div className="banner-content">
              <h2>Unlimited movies, TV shows, and more.</h2>
              <p>Watch anywhere. Cancel anytime.</p>
              <button className="subscribe-button">
                Subscribe Now
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Questions? Contact us.</h3>
              <div className="footer-links">
                <a href="#">FAQ</a>
                <a href="#">Help Center</a>
                <a href="#">Terms of Use</a>
                <a href="#">Privacy</a>
                <a href="#">Cookie Preferences</a>
                <a href="#">Corporate Information</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Account</h3>
              <div className="footer-links">
                <a href="#">Manage Profiles</a>
                <a href="#">Subscription</a>
                <a href="#">Redeem Gift Cards</a>
                <a href="#">Buy Gift Cards</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Ways to Watch</h3>
              <div className="footer-links">
                <a href="#">TV</a>
                <a href="#">Mobile</a>
                <a href="#">Tablet</a>
                <a href="#">Computer</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Netflix Clone. For educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;