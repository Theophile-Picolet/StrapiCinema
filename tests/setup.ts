import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Simple setup for integration tests
// Assumes Strapi is already running

let app: any;

beforeAll(async () => {
  // Get Strapi URL from environment variable or default
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  app = strapiUrl;
  
  console.log(`Testing against Strapi at: ${strapiUrl}`);
}, 10000);

// Make app available globally for tests
(globalThis as any).strapi = { server: { httpServer: app } };
