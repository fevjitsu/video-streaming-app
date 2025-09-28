import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/main.css';
import '../styles/components.css';

const ProfileSwitcher = ({ profiles, currentProfile, onProfileSelect, onProfileEdit, onProfileDelete, onProfileCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useAuth();

  const ProfileCard = ({ profile, isCurrent = false }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`profile-card ${isCurrent ? 'current' : ''}`}
      onClick={() => !isEditing && onProfileSelect(profile)}
    >
      <div className="profile-avatar">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} />
        ) : (
          <div className="profile-initial">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="profile-name">
        {profile.name}
      </div>

      {profile.watchStats?.totalHours > 0 && (
        <div className="profile-analytics-badge">
          {Math.round(profile.watchStats.totalHours)}h
        </div>
      )}

      {isEditing && (
        <div className="profile-edit-overlay">
          <button
            onClick={() => onProfileEdit(profile)}
            className="edit-profile-btn"
          >
            <Edit size={16} />
          </button>
          {profiles.length > 1 && (
            <button
              onClick={() => onProfileDelete(profile.id)}
              className="delete-profile-btn"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="profile-switcher">
      <div className="profile-header">
        <h2 className="profile-title">Who's watching?</h2>
        
        <div className="profile-controls">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="manage-profiles-btn"
          >
            {isEditing ? 'Done' : 'Manage Profiles'}
          </button>
          
          <button
            onClick={() => {/* Navigate to analytics */}}
            className="analytics-btn"
            title="View Analytics"
          >
            <BarChart3 size={24} />
          </button>
        </div>
      </div>

      <div className="profiles-grid">
        {profiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isCurrent={profile.id === currentProfile?.id}
          />
        ))}
        
        {profiles.length < 5 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="add-profile-card"
            onClick={onProfileCreate}
          >
            <div className="add-profile-avatar">
              <Plus className="add-profile-icon" size={48} />
            </div>
            <div className="add-profile-text">
              Add Profile
            </div>
          </motion.div>
        )}
      </div>

      <div className="analytics-summary">
        <h3 className="analytics-title">Viewing Activity</h3>
        <div className="analytics-grid">
          <div className="analytics-item">
            <div className="analytics-value">
              {profiles.reduce((total, p) => total + (p.watchStats?.totalMovies || 0), 0)}
            </div>
            <div className="analytics-label">Movies Watched</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-value">
              {Math.round(profiles.reduce((total, p) => total + (p.watchStats?.totalHours || 0), 0))}h
            </div>
            <div className="analytics-label">Total Watch Time</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-value">
              {profiles.reduce((total, p) => total + (p.likedMovies?.length || 0), 0)}
            </div>
            <div className="analytics-label">Liked Content</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSwitcher;