import { beforeAll, afterAll } from 'vitest';
import { db } from '../server/db';

// Global test setup
beforeAll(async () => {
  // Initialize test database connections
  console.log('Setting up test environment...');
});

// Global test cleanup
afterAll(async () => {
  // Clean up database connections
  console.log('Cleaning up test environment...');
  // Close database connections if needed
});

// Global test configuration
export const testConfig = {
  timeout: 5000,
  retries: 2,
};