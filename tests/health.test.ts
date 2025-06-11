import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../server/routes';

describe('Health Check', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should return 200 OK for GET /health', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
    expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
  });

  it('should return valid JSON response', async () => {
    const response = await request(app).get('/health');
    
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toBeDefined();
  });
});