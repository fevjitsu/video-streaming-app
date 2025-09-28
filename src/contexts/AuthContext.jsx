import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import '../styles/auth.css';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setAuthError('');
      setAuthSuccess('');
    }, 5000);
  };

  // Set error message
  const setError = (message) => {
    setAuthError(message);
    setAuthSuccess('');
    clearMessages();
  };

  // Set success message
  const setSuccess = (message) => {
    setAuthSuccess(message);
    setAuthError('');
    clearMessages();
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        setUserPreferences({});
        setUserSubscription(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Set user preferences
        setUserPreferences(userData.preferences || {
          language: 'en',
          autoplay: true,
          quality: 'hd',
          notifications: true,
          maturityRating: 'PG-13'
        });

        // Set subscription data
        if (userData.subscription) {
          setUserSubscription(userData.subscription);
        }

        // Load profiles and set current profile
        if (userData.profiles && userData.profiles.length > 0) {
          const profiles = userData.profiles;
          setCurrentProfile(profiles[0]);
          
          // Restore last active profile if available
          if (userData.lastActiveProfile) {
            const lastProfile = profiles.find(p => p.id === userData.lastActiveProfile);
            if (lastProfile) {
              setCurrentProfile(lastProfile);
            }
          }
        } else {
          // Create default profile if none exists
          await createDefaultProfile(userId);
        }
      } else {
        // Create user document if it doesn't exist
        await createUserDocument(userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  // Create user document in Firestore
  const createUserDocument = async (userId, userData = {}) => {
    try {
      const userDoc = {
        email: auth.currentUser?.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        subscription: {
          status: 'inactive',
          plan: null,
          startDate: null,
          endDate: null,
          stripeCustomerId: null
        },
        preferences: {
          language: 'en',
          autoplay: true,
          quality: 'hd',
          notifications: true,
          maturityRating: 'PG-13',
          ...userData.preferences
        },
        profiles: userData.profiles || [],
        watchHistory: [],
        analytics: {
          totalWatchTime: 0,
          moviesWatched: 0,
          seriesWatched: 0,
          averageRating: 0,
          favoriteGenres: [],
          lastWatched: null
        },
        ...userData
      };

      await setDoc(doc(db, 'users', userId), userDoc);
      setUserPreferences(userDoc.preferences);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  // Create default profile for new users
  const createDefaultProfile = async (userId) => {
    try {
      const defaultProfile = {
        id: 'default',
        name: 'Default',
        avatar: null,
        isChild: false,
        pinProtected: false,
        restrictions: [],
        likedMovies: [],
        dislikedMovies: [],
        watchlist: [],
        continueWatching: [],
        watchStats: {
          totalHours: 0,
          totalMovies: 0,
          totalSeries: 0,
          lastWatched: null
        },
        createdAt: new Date()
      };

      await updateDoc(doc(db, 'users', userId), {
        profiles: [defaultProfile]
      });

      setCurrentProfile(defaultProfile);
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  // Sign up with email and password
  const signup = async (email, password, userData = {}) => {
    try {
      setError('');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile if name provided
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }

      // Create user document with enhanced data structure
      await createUserDocument(user.uid, userData);
      
      setSuccess('Account created successfully!');
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      handleAuthError(error);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError('');
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date()
      });
      
      setSuccess('Welcome back!');
      return user;
    } catch (error) {
      console.error('Login error:', error);
      handleAuthError(error);
      throw error;
    }
  };

  // Google sign-in
  const signInWithGoogle = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(user.uid, {
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date()
        });
      }
      
      setSuccess('Signed in with Google successfully!');
      return user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      handleAuthError(error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setSuccess('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      handleAuthError(error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      handleAuthError(error);
      throw error;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    if (!currentUser) return;

    try {
      const newPreferences = { ...userPreferences, ...preferences };
      setUserPreferences(newPreferences);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        preferences: newPreferences
      });
      
      setSuccess('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences');
      throw error;
    }
  };

  // Switch between profiles
  const switchProfile = async (profile) => {
    setCurrentProfile(profile);
    
    // Update last active profile in database
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastActiveProfile: profile.id
        });
      } catch (error) {
        console.error('Error updating last active profile:', error);
      }
    }
  };

  // Create new profile
  const createProfile = async (profileData) => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const currentProfiles = userDoc.data()?.profiles || [];
      
      const newProfile = {
        id: `profile_${Date.now()}`,
        name: profileData.name,
        avatar: profileData.avatar || null,
        isChild: profileData.isChild || false,
        pinProtected: profileData.pinProtected || false,
        restrictions: profileData.restrictions || [],
        likedMovies: [],
        dislikedMovies: [],
        watchlist: [],
        continueWatching: [],
        watchStats: {
          totalHours: 0,
          totalMovies: 0,
          totalSeries: 0,
          lastWatched: null
        },
        createdAt: new Date()
      };

      const updatedProfiles = [...currentProfiles, newProfile];
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profiles: updatedProfiles
      });

      setCurrentProfile(newProfile);
      setSuccess(`Profile "${profileData.name}" created successfully`);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile');
      throw error;
    }
  };

  // Update profile
  const updateProfileData = async (profileId, updates) => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const profiles = userDoc.data()?.profiles || [];
      
      const updatedProfiles = profiles.map(profile =>
        profile.id === profileId ? { ...profile, ...updates } : profile
      );
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profiles: updatedProfiles
      });

      // Update current profile if it's the one being updated
      if (currentProfile?.id === profileId) {
        setCurrentProfile({ ...currentProfile, ...updates });
      }

      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      throw error;
    }
  };

  // Delete profile
  const deleteProfile = async (profileId) => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const profiles = userDoc.data()?.profiles || [];
      
      if (profiles.length <= 1) {
        setError('Cannot delete the last profile');
        return;
      }

      const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profiles: updatedProfiles
      });

      // Switch to another profile if current one was deleted
      if (currentProfile?.id === profileId) {
        setCurrentProfile(updatedProfiles[0]);
      }

      setSuccess('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError('Failed to delete profile');
      throw error;
    }
  };

  // Track movie interaction (like/dislike)
  const trackMovieInteraction = async (movieId, interactionType) => {
    if (!currentUser || !currentProfile) return;

    try {
      const profileRef = doc(db, 'users', currentUser.uid, 'profiles', currentProfile.id);
      
      if (interactionType === 'like') {
        await updateDoc(profileRef, {
          likedMovies: [...new Set([...currentProfile.likedMovies, movieId])],
          dislikedMovies: currentProfile.dislikedMovies.filter(id => id !== movieId)
        });
      } else if (interactionType === 'dislike') {
        await updateDoc(profileRef, {
          dislikedMovies: [...new Set([...currentProfile.dislikedMovies, movieId])],
          likedMovies: currentProfile.likedMovies.filter(id => id !== movieId)
        });
      } else if (interactionType === 'remove') {
        await updateDoc(profileRef, {
          likedMovies: currentProfile.likedMovies.filter(id => id !== movieId),
          dislikedMovies: currentProfile.dislikedMovies.filter(id => id !== movieId)
        });
      }

      // Update local state
      setCurrentProfile(prev => ({
        ...prev,
        likedMovies: interactionType === 'like' 
          ? [...new Set([...prev.likedMovies, movieId])]
          : interactionType === 'dislike'
          ? prev.likedMovies.filter(id => id !== movieId)
          : prev.likedMovies,
        dislikedMovies: interactionType === 'dislike'
          ? [...new Set([...prev.dislikedMovies, movieId])]
          : interactionType === 'like'
          ? prev.dislikedMovies.filter(id => id !== movieId)
          : prev.dislikedMovies
      }));

    } catch (error) {
      console.error('Error tracking movie interaction:', error);
    }
  };

  // Add to watchlist
  const addToWatchlist = async (movieId) => {
    if (!currentUser || !currentProfile) return;

    try {
      const profileRef = doc(db, 'users', currentUser.uid, 'profiles', currentProfile.id);
      const updatedWatchlist = [...new Set([...currentProfile.watchlist, movieId])];
      
      await updateDoc(profileRef, {
        watchlist: updatedWatchlist
      });

      setCurrentProfile(prev => ({
        ...prev,
        watchlist: updatedWatchlist
      }));

    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (movieId) => {
    if (!currentUser || !currentProfile) return;

    try {
      const profileRef = doc(db, 'users', currentUser.uid, 'profiles', currentProfile.id);
      const updatedWatchlist = currentProfile.watchlist.filter(id => id !== movieId);
      
      await updateDoc(profileRef, {
        watchlist: updatedWatchlist
      });

      setCurrentProfile(prev => ({
        ...prev,
        watchlist: updatedWatchlist
      }));

    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  // Handle auth errors
  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('Email is already registered. Please sign in.');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address.');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters.');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password.');
        break;
      case 'auth/too-many-requests':
        setError('Too many attempts. Please try again later.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your connection.');
        break;
      default:
        setError('An error occurred. Please try again.');
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    return userSubscription?.status === 'active' && 
           userSubscription?.endDate > new Date();
  };

  // Get subscription info
  const getSubscriptionInfo = () => {
    return {
      hasSubscription: hasActiveSubscription(),
      plan: userSubscription?.plan,
      status: userSubscription?.status,
      endDate: userSubscription?.endDate
    };
  };

  // Context value
  const value = {
    // User state
    currentUser,
    currentProfile,
    userPreferences,
    userSubscription,
    loading,
    authError,
    authSuccess,
    
    // Auth methods
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    
    // Profile methods
    switchProfile,
    createProfile,
    updateProfileData,
    deleteProfile,
    
    // Preference methods
    updatePreferences,
    
    // Content interaction methods
    trackMovieInteraction,
    addToWatchlist,
    removeFromWatchlist,
    
    // Subscription methods
    hasActiveSubscription,
    getSubscriptionInfo,
    
    // Message methods
    setError,
    setSuccess,
    clearMessages: () => {
      setAuthError('');
      setAuthSuccess('');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Auth Messages Overlay */}
      {(authError || authSuccess) && (
        <div className="auth-messages-overlay">
          <div className={`auth-message ${authError ? 'error' : 'success'}`}>
            <span>{authError || authSuccess}</span>
            <button 
              onClick={() => {
                setAuthError('');
                setAuthSuccess('');
              }}
              className="auth-message-close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;