module.exports = {
  preset: 'jest-expo',
  transform: { '^.+\\.mjs$': ['babel-jest', { presets: ['babel-preset-expo'] }] },
  transformIgnorePatterns: ['/node_modules/(?!(.pnpm|react-native|@react-native|expo|@expo|react-navigation|@react-navigation|lucide-react-native|react-native-svg))'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/utils/*.js', 'src/database/**/*.js', '!src/database/db.js'],
};
