# PRE Group Mobile App

A modern property management mobile application built with Vue 3, Quasar Framework, and Firebase.

## 🚀 Features

### Authentication & User Management
- **User Registration**: Multi-step registration process with email verification
- **User Login**: Secure authentication with Firebase Auth
- **Password Management**: Password visibility toggle and secure storage
- **Social Login**: Google Sign-In integration (ready for implementation)

### Registration Flow
1. **Onboarding**: Welcome screen with app introduction
2. **Email Input**: Initial registration with email
3. **Email Verification**: OTP verification with resend functionality
4. **Property Details**: Project and unit selection with role assignment
5. **Personal Details**: Comprehensive user information collection
6. **Account Creation**: Firebase account creation with user data

### User Interface
- **Responsive Design**: Mobile-first design with tablet and desktop support
- **Modern UI**: Clean, intuitive interface following Material Design principles
- **Dark Theme**: Elegant dark headers with light content areas
- **Orange Accent**: Consistent #ff6b35 brand color throughout the app

### Navigation & Routing
- **Protected Routes**: Authentication-based route protection
- **Tab Navigation**: Seamless switching between Personal and Property registration steps
- **Bottom Navigation**: Home, Services, Profile, and Analytics sections
- **Breadcrumb Navigation**: Clear user journey indication

## 🏗️ Project Structure

```
src/
├── boot/                    # App initialization
│   ├── firebase.js         # Firebase configuration & services
│   ├── axios.js            # HTTP client setup
│   └── i18n.js            # Internationalization
├── components/             # Reusable UI components
│   ├── SplashScreen.vue   # App loading screen
│   └── FirebaseExample.vue # Firebase usage examples
├── pages/                  # Application pages
│   ├── auth/              # Authenticated user pages
│   │   └── Home.vue       # Main dashboard
│   └── unauth/            # Unauthenticated user pages
│       ├── Onboarding.vue # Welcome & registration start
│       ├── SignIn.vue     # User login
│       ├── Register.vue   # Registration with tabs
│       ├── VerifyEmail.vue # Email verification
│       ├── PersonalDetails.vue # User information form
│       └── Support.vue    # Help & support page
├── stores/                 # State management
│   ├── splash.js          # Splash screen state
│   └── [other stores]     # Additional state management
├── utils/                  # Utility functions
│   └── splashUtils.js     # Splash screen utilities
└── router/                 # Application routing
    └── index.js           # Route definitions & guards
```

## 🎨 Design System

### Color Palette
- **Primary**: #ff6b35 (Orange)
- **Secondary**: #222222 (Dark Gray)
- **Background**: #f8f9fa (Light Gray)
- **Text Primary**: #333333 (Dark)
- **Text Secondary**: #666666 (Medium Gray)
- **Border**: #e1e5e9 (Light Gray)

### Typography
- **Headings**: Roboto, 700 weight
- **Body**: Roboto, 400 weight
- **Buttons**: Roboto, 600 weight

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Rounded corners with hover effects
- **Inputs**: Clean borders with focus states
- **Icons**: Consistent SVG iconography

## 🔧 Technical Stack

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Quasar Framework**: Vue-based UI framework
- **Composition API**: Modern Vue 3 syntax
- **Pinia**: State management
- **Vue Router**: Client-side routing

### Backend & Services
- **Firebase**: Backend-as-a-Service
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Hosting

### Development Tools
- **Vite**: Fast build tool
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd pre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update `src/boot/firebase.js` with your config

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 App Flow

### Unauthenticated Users
1. **Onboarding** → Welcome screen with app introduction
2. **Registration** → Multi-step account creation
3. **Sign In** → Existing user authentication
4. **Support** → Help and contact information

### Authenticated Users
1. **Home Dashboard** → Main app interface
2. **News Feed** → Community updates and notifications
3. **Emergency Alerts** → Critical information display
4. **Profile Management** → User account settings

## 🔐 Security Features

- **Route Protection**: Authentication-based access control
- **Input Validation**: Form validation and sanitization
- **Secure Storage**: Firebase Security Rules
- **Password Security**: Secure password handling

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop Compatible**: Full desktop experience
- **Touch Friendly**: Optimized touch interactions

## 🧪 Testing

### Manual Testing
- Test all registration flows
- Verify authentication states
- Check responsive breakpoints
- Validate form submissions

### Automated Testing
```bash
npm run test
```

## 🚀 Deployment

### Firebase Hosting
1. Build the project: `npm run build`
2. Deploy to Firebase: `firebase deploy`

### Other Platforms
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **AWS S3**: Static hosting

## 📚 Documentation

- **Firebase Setup**: See `FIREBASE_SETUP.md`
- **Component Usage**: Check individual component files
- **API Reference**: Firebase documentation
- **Design Guidelines**: See `DESIGN_SYSTEM.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Email**: support@pre-group.com
- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issues for bugs
- **Feature Requests**: Submit through support channels

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added support page and improved UX
- **v1.2.0**: Enhanced registration flow and validation

---

Built with ❤️ by the PRE Group development team
