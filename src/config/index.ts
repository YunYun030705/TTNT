// Environment configuration utility
export const config = {
  // Firebase configuration
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  },

  // API configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  },

  // Face recognition configuration
  faceRecognition: {
    matchThreshold: parseFloat(process.env.REACT_APP_FACE_MATCH_THRESHOLD || '0.6'),
    maxImageSize: parseInt(process.env.REACT_APP_MAX_IMAGE_SIZE || '5242880'), // 5MB
  },

  // Application configuration
  app: {
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
    isDevelopment: process.env.REACT_APP_ENVIRONMENT === 'development',
    isProduction: process.env.REACT_APP_ENVIRONMENT === 'production',
  }
};

// Validation function to check if all required environment variables are set
export const validateConfig = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }

  return true;
};

// Log configuration in development
if (config.app.isDevelopment) {
  console.log('App Configuration:', {
    environment: config.app.environment,
    apiBaseUrl: config.api.baseUrl,
    firebaseProjectId: config.firebase.projectId,
  });
}