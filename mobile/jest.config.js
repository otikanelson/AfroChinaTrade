module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jestSetupPatch.js'],
  moduleNameMapper: {
    'expo-modules-core/src/Refs': '<rootDir>/../node_modules/expo-modules-core/src/Refs',
    'expo-modules-core/src/web/index\\.web': '<rootDir>/jestModuleMocks/expoModulesCoreWeb.js',
    'expo-modules-core/src/uuid/uuid\\.web': '<rootDir>/../node_modules/expo-modules-core/src/uuid/uuid.web',
    'expo/src/winter/FormData': '<rootDir>/jestModuleMocks/expoWinterFormData.js',
    'expo/src/winter': '<rootDir>/jestModuleMocks/expoWinter.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
