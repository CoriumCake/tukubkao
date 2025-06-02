import Constants from 'expo-constants';

const ENV = {
  dev: {
    // Add any development environment variables here
  },
  prod: {
    // Add any production environment variables here
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars(); 