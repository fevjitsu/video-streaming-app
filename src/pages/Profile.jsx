import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, 
  Save, 
  X, 
  Camera, 
  Lock, 
  Bell, 
  Globe, 
  Eye, 
  Trash2,
  Plus,
  BarChart3,
  Clock,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/NavBar';
import '../styles/profile.css';

const Profile = () => {
  const { 
    currentUser, 
    currentProfile, 
    userPreferences, 
    updatePreferences, 
    updateProfileData,
    createProfile,
    deleteProfile,
    switchProfile,
    trackMovieInteraction 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    isChild: false,
    pinProtected: false,
    pin: ''
  });
  const [watchHistory, setWatchHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Initialize edited profile when current profile changes
  useEffect(() => {
    if (currentProfile) {
      setEditedProfile({ ...currentProfile });
      loadWatchHistory();
      loadAnalytics();
    }
  }, [currentProfile]);

  // Mock watch history data
  const loadWatchHistory = async () => {
    // Simulate API call
    setTimeout(() => {
      setWatchHistory([
        {
          id: 1,
          title: "Stranger Things",
          type: "TV Show",
          season: 4,
          episode: 3,
          poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          progress: 75,
          duration: 45,
          watchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          continueTime: 1200 // 20 minutes in seconds
        },
        {
          id: 2,
          title: "The Gray Man",
          type: "Movie",
          poster: "/8cXbitsS6dWQ5gfMTZdorpAAzEH.jpg",
          progress: 100,
          duration: 129,
          watchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          rating: 4
        }
      ]);
    }, 500);
  };

  // Mock analytics data
  const loadAnalytics = async () => {
    setTimeout(() => {
      setAnalytics({
        totalWatchTime: 14520, // in minutes
        moviesWatched: 45,
        seriesWatched: 12,
        averageRating: 4.2,
        favoriteGenres: ["Action", "Thriller", "Sci-Fi"],
        dailyAverage: 120, // minutes
        topContent: [
          { title: "Stranger Things", hours: 24, type: "Series" },
          { title: "The Gray Man", hours: 2.1, type: "Movie" },
          { title: "Ozark", hours: 18, type: "Series" }
        ]
      });
    }, 500);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile || !currentProfile) return;

    try {
      await updateProfileData(currentProfile.id, editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...currentProfile });
    setIsEditing(false);
  };

  const handleCreateProfile = async () => {
    if (!newProfileData.name.trim()) return;

    try {
      await createProfile(newProfileData);
      setShowCreateProfile(false);
      setNewProfileData({
        name: '',
        isChild: false,
        pinProtected: false,
        pin: ''
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentProfile) return;

    try {
      await deleteProfile(currentProfile.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    await updatePreferences({ [key]: value });
  };

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!currentProfile) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Navbar />
      
      <div className="profile-content">
        {/* Header Section */}
        <section className="profile-header">
          <div className="container">
            <div className="header-content">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {currentProfile.avatar ? (
                    <img src={currentProfile.avatar} alt={currentProfile.name} />
                  ) : (
                    <span className="avatar-initial">
                      {currentProfile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {isEditing && (
                    <button className="avatar-edit-btn">
                      <Camera size={20} />
                    </button>
                  )}
                </div>
                
                <div className="profile-info">
                  <div className="profile-name-section">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="name-input"
                        maxLength={20}
                      />
                    ) : (
                      <h1 className="profile-name">{currentProfile.name}</h1>
                    )}
                    
                    {currentProfile.isChild && (
                      <span className="child-badge">Kids</span>
                    )}
                  </div>
                  
                  <p className="profile-email">{currentUser?.email}</p>
                  <p className="profile-stats">
                    {watchHistory.length} titles watched • {analytics ? formatWatchTime(analytics.totalWatchTime) : '0h 0m'} total
                  </p>
                </div>
              </div>
              
              <div className="profile-actions">
                {isEditing ? (
                  <div className="edit-actions">
                    <button className="btn-secondary" onClick={handleCancelEdit}>
                      <X size={18} />
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveProfile}>
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="view-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                    <button className="btn-tertiary">
                      <BarChart3 size={18} />
                      View Analytics
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="profile-tabs">
          <div className="container">
            <nav className="tabs-navigation">
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Settings
              </button>
              <button 
                className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferences
              </button>
              <button 
                className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Watch History
              </button>
              <button 
                className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Viewing Analytics
              </button>
            </nav>
          </div>
        </section>

        {/* Tab Content */}
        <section className="tab-content">
          <div className="container">
            <AnimatePresence mode="wait">
              {/* Profile Settings Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="tab-panel"
                >
                  <div className="settings-grid">
                    <div className="setting-card">
                      <h3>Profile Information</h3>
                      <div className="setting-fields">
                        <div className="form-group">
                          <label>Display Name</label>
                          <input
                            type="text"
                            value={editedProfile?.name || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                            disabled={!isEditing}
                            maxLength={20}
                          />
                          <span className="char-count">{editedProfile?.name?.length || 0}/20</span>
                        </div>
                        
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={editedProfile?.isChild || false}
                              onChange={(e) => setEditedProfile({...editedProfile, isChild: e.target.checked})}
                              disabled={!isEditing}
                            />
                            <span>Kids Profile</span>
                          </label>
                          <p className="setting-description">
                            Kids profiles only show content rated for children.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="setting-card">
                      <h3>Security</h3>
                      <div className="setting-fields">
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={editedProfile?.pinProtected || false}
                              onChange={(e) => setEditedProfile({...editedProfile, pinProtected: e.target.checked})}
                              disabled={!isEditing}
                            />
                            <span>PIN Protection</span>
                          </label>
                          <p className="setting-description">
                            Require a PIN to access this profile.
                          </p>
                        </div>
                        
                        {editedProfile?.pinProtected && isEditing && (
                          <div className="form-group">
                            <label>PIN Code</label>
                            <input
                              type="password"
                              placeholder="Enter 4-digit PIN"
                              maxLength={4}
                              pattern="[0-9]*"
                              inputMode="numeric"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="setting-card danger-zone">
                      <h3>Danger Zone</h3>
                      <div className="danger-actions">
                        <p>Permanently delete this profile and all its data.</p>
                        <button 
                          className="btn-danger"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <Trash2 size={18} />
                          Delete Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="tab-panel"
                >
                  <div className="preferences-grid">
                    <div className="preference-card">
                      <div className="preference-header">
                        <Globe size={24} />
                        <h3>Language & Region</h3>
                      </div>
                      <div className="preference-options">
                        <div className="form-group">
                          <label>Language</label>
                          <select 
                            value={userPreferences.language || 'en'}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="preference-card">
                      <div className="preference-header">
                        <Eye size={24} />
                        <h3>Playback Settings</h3>
                      </div>
                      <div className="preference-options">
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={userPreferences.autoplay || true}
                              onChange={(e) => handlePreferenceChange('autoplay', e.target.checked)}
                            />
                            <span>Autoplay next episode</span>
                          </label>
                        </div>
                        
                        <div className="form-group">
                          <label>Default Video Quality</label>
                          <select 
                            value={userPreferences.quality || 'hd'}
                            onChange={(e) => handlePreferenceChange('quality', e.target.value)}
                          >
                            <option value="auto">Auto</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="hd">HD</option>
                            <option value="uhd">Ultra HD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="preference-card">
                      <div className="preference-header">
                        <Bell size={24} />
                        <h3>Notifications</h3>
                      </div>
                      <div className="preference-options">
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={userPreferences.notifications || true}
                              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                            />
                            <span>Email notifications</span>
                          </label>
                        </div>
                        
                        <div className="form-group">
                          <label>Maturity Rating</label>
                          <select 
                            value={userPreferences.maturityRating || 'PG-13'}
                            onChange={(e) => handlePreferenceChange('maturityRating', e.target.value)}
                          >
                            <option value="G">G - General Audience</option>
                            <option value="PG">PG - Parental Guidance</option>
                            <option value="PG-13">PG-13 - Teens</option>
                            <option value="R">R - Restricted</option>
                            <option value="NC-17">NC-17 - Adults Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Watch History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="tab-panel"
                >
                  <div className="history-header">
                    <h2>Watch History</h2>
                    <button className="btn-secondary">
                      Clear All History
                    </button>
                  </div>
                  
                  <div className="history-list">
                    {watchHistory.map((item) => (
                      <div key={item.id} className="history-item">
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${item.poster}`} 
                          alt={item.title}
                          className="history-poster"
                        />
                        
                        <div className="history-info">
                          <div className="history-main">
                            <h4>{item.title}</h4>
                            <span className="history-type">{item.type}</span>
                            {item.season && (
                              <span className="history-episode">S{item.season} E{item.episode}</span>
                            )}
                          </div>
                          
                          <div className="history-meta">
                            <span className="history-time">
                              {formatTimeAgo(item.watchedAt)}
                            </span>
                            {item.rating && (
                              <div className="history-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span 
                                    key={i}
                                    className={`star ${i < item.rating ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {item.progress < 100 && (
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                              <span>Continue from {Math.floor(item.continueTime / 60)}m</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="history-actions">
                          <button className="action-btn">
                            <Clock size={16} />
                          </button>
                          <button className="action-btn">
                            <ThumbsUp size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="tab-panel"
                >
                  {analytics ? (
                    <div className="analytics-grid">
                      <div className="stat-card primary">
                        <div className="stat-icon">
                          <Clock size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>{formatWatchTime(analytics.totalWatchTime)}</h3>
                          <p>Total Watch Time</p>
                        </div>
                      </div>
                      
                      <div className="stat-card secondary">
                        <div className="stat-icon">
                          <Heart size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>{analytics.moviesWatched + analytics.seriesWatched}</h3>
                          <p>Titles Watched</p>
                        </div>
                      </div>
                      
                      <div className="stat-card tertiary">
                        <div className="stat-icon">
                          <BarChart3 size={24} />
                        </div>
                        <div className="stat-content">
                          <h3>{analytics.averageRating}/5</h3>
                          <p>Average Rating</p>
                        </div>
                      </div>
                      
                      <div className="analytics-card">
                        <h3>Favorite Genres</h3>
                        <div className="genres-list">
                          {analytics.favoriteGenres.map((genre, index) => (
                            <span key={genre} className="genre-tag">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="analytics-card">
                        <h3>Top Content</h3>
                        <div className="top-content-list">
                          {analytics.topContent.map((content, index) => (
                            <div key={content.title} className="top-content-item">
                              <span className="rank">#{index + 1}</span>
                              <span className="title">{content.title}</span>
                              <span className="hours">{content.hours}h</span>
                              <span className="type">{content.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="loading-analytics">
                      <div className="loading-spinner"></div>
                      <p>Loading analytics...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Create Profile Modal */}
      <AnimatePresence>
        {showCreateProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
            >
              <h2>Create New Profile</h2>
              
              <div className="form-group">
                <label>Profile Name</label>
                <input
                  type="text"
                  value={newProfileData.name}
                  onChange={(e) => setNewProfileData({...newProfileData, name: e.target.value})}
                  placeholder="Enter profile name"
                  maxLength={20}
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProfileData.isChild}
                    onChange={(e) => setNewProfileData({...newProfileData, isChild: e.target.checked})}
                  />
                  <span>Kids Profile</span>
                </label>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProfileData.pinProtected}
                    onChange={(e) => setNewProfileData({...newProfileData, pinProtected: e.target.checked})}
                  />
                  <span>PIN Protection</span>
                </label>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCreateProfile(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleCreateProfile}
                  disabled={!newProfileData.name.trim()}
                >
                  Create Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content danger"
            >
              <h2>Delete Profile</h2>
              <p>Are you sure you want to delete the profile "{currentProfile.name}"? This action cannot be undone.</p>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteProfile}
                >
                  Delete Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;