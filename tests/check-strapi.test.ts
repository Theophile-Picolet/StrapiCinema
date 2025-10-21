import request from 'supertest';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

describe('Strapi Health Check', () => {
  it('should connect to running Strapi instance', async () => {
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    console.log(`Checking Strapi at: ${strapiUrl}`);
    
    const response = await request(strapiUrl)
      .get('/api/movies')
      .timeout(5000);

    console.log(`Response status: ${response.status}`);
    
    // Accept various responses: 200 (OK), 403 (permission denied), 404 (not found), 426 (upgrade required)
    expect([200, 403, 404, 426]).toContain(response.status);
  });
});
