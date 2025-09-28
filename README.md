# 🎬 Video-streaming-app - React & Firebase Streaming Platform

A fully-featured Video-streaming-app built with modern web technologies including React, Firebase, and Stripe integration. This application replicates the core functionality of Netflix with user authentication, profile management, subscription handling, and content interaction tracking.

![Video-streaming-app](https://img.shields.io/badge/Netflix-Clone-red) ![React](https://img.shields.io/badge/React-18.2-blue) ![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange) ![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)

## ✨ Features

### 🔐 Authentication & User Management
- **Firebase Authentication** with email/password and Google sign-in
- **Multiple User Profiles** per account with individual settings
- **Profile Switching** with persistent preferences
- **PIN Protection** for kids profiles
- **Secure Session Management**

### 🎬 Content & Streaming
- **Movie & TV Show Browsing** with genre-based categorization
- **Advanced Search** with real-time results and debouncing
- **Video Player** with DRM support and quality controls
- **Content Recommendations** based on viewing history
- **Continue Watching** feature with progress tracking

### 💰 Subscription & Payments
- **Stripe Integration** for secure payment processing
- **Multiple Subscription Plans** (Basic, Standard, Premium)
- **Monthly/Yearly Billing** cycles with savings
- **Payment History** and invoice management
- **Subscription Management** (upgrade/downgrade/cancel)

### 👤 Profile & Personalization
- **Personalized Profiles** with custom avatars and names
- **Content Interaction Tracking** (likes, dislikes, watchlist)
- **Viewing Analytics** with watch time statistics
- **Preferences Management** (language, quality, autoplay)
- **Watch History** with detailed tracking

### 🎨 UI/UX Features
- **Netflix-inspired Design** with modern CSS
- **Responsive Design** for all screen sizes
- **Smooth Animations** using Framer Motion
- **Advanced Hover Effects** and micro-interactions
- **Glass Morphism** and backdrop filters
- **Accessibility-First** approach with keyboard navigation

## 🚀 Tech Stack

### Frontend
- **React 18** with Hooks and Context API
- **Vite** for fast development and building
- **React Router DOM** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend & Services
- **Firebase Authentication** for user management
- **Cloud Firestore** for real-time database
- **Firebase Storage** for media files
- **Stripe API** for payment processing
- **TMDB API** for movie data (mock implementation)

### Styling
- **Custom CSS** with CSS Variables
- **Advanced CSS Grid & Flexbox**
- **Glass Morphism Effects**
- **Responsive Design Patterns**
- **CSS Animations & Transitions**

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- Firebase project setup
- Stripe account for payments

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/netflix-clone.git
cd netflix-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Encryption
VITE_ENCRYPTION_SECRET=your_encryption_secret_key
```

### 4. Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create a Firestore Database
4. Set up Storage Bucket
5. Add your web app to get configuration keys

### 5. Stripe Setup
1. Create a Stripe account
2. Get your publishable key from the dashboard
3. Set up webhook endpoints for payment processing

### 6. Run the Application
```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with search & user menu
│   ├── MovieCard.jsx   # Movie display with hover effects
│   ├── MovieCarousel.jsx # Horizontal scrolling carousels
│   ├── SearchBar.jsx   # Advanced search functionality
│   └── ProfileSwitcher.jsx # Multi-profile management
├── contexts/           # React Context providers
│   └── AuthContext.jsx # Authentication & user state
├── pages/              # Main application pages
│   ├── Home.jsx        # Landing page with featured content
│   ├── Profile.jsx     # User profile management
│   └── Subscription.jsx # Subscription plans & payment
├── services/           # External API services
│   ├── firebase/       # Firebase configuration
│   ├── stripe/         # Stripe payment integration
│   └── tmdbAPI.js      # Movie database API (mock)
├── styles/             # CSS stylesheets
│   ├── advanced.css    # Advanced CSS utilities
│   ├── animations.css  # Animation keyframes
│   ├── home.css        # Home page styles
│   ├── navbar.css      # Navigation styles
│   ├── profile.css     # Profile page styles
│   └── subscription.css # Subscription page styles
└── utils/              # Helper functions
    └── encryption.js   # Data encryption utilities
```

## 🔧 Configuration

### Firebase Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Profiles subcollection
      match /profiles/{profileId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public content (read-only)
    match /movies/{movieId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /content/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🎯 Key Components

### AuthContext
Centralized authentication management with:
- User state persistence
- Profile switching
- Preference management
- Subscription status tracking

### MovieCard
Advanced movie display component featuring:
- Hover video previews
- Like/dislike interactions
- Add to watchlist functionality
- Smooth animations

### SearchBar
Intelligent search with:
- Debounced API calls
- Real-time results
- Keyboard navigation
- Search history

### Subscription Component
Complete payment flow with:
- Plan comparison
- Stripe Checkout integration
- Billing cycle toggles
- Payment history

## 🔒 Security Features

- **Data Encryption**: Sensitive user data encrypted before storage
- **DRM Support**: Video content protection
- **PIN Protection**: Kids profile security
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **Secure Authentication**: Firebase Auth with session management

## 📱 Responsive Design

The application is fully responsive across all device sizes:

- **Desktop**: Full-featured experience with hover effects
- **Tablet**: Optimized touch interactions
- **Mobile**: Streamlined interface with touch-friendly controls

## 🎨 Customization

### Theming
Modify CSS variables in `:root` to customize the appearance:

```css
:root {
  --netflix-red: #e50914;
  --netflix-black: #141414;
  --netflix-gray: #808080;
  /* Add your custom colors */
}
```

### Content Sources
Replace the mock TMDB service with real API integration:

```javascript
// In src/services/tmdbAPI.js
export const getFeaturedContent = async () => {
  const response = await fetch('https://api.themoviedb.org/3/trending/all/week?api_key=YOUR_API_KEY');
  return await response.json();
};
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Build project
npm run build

# Deploy dist folder to Netlify
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Netflix for design inspiration
- TMDB for movie data API
- Firebase for backend services
- Stripe for payment processing
- Vite for excellent build tooling

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@netflixclone.com
- Documentation: [Docs](https://docs.netflixclone.com)

---

**Note**: This is a demonstration project for educational purposes. Not affiliated with Netflix.