import { fetchMCD311Complaints } from '../lib/mcd311';

describe('MCD311 Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('fetches complaints with source "mcd311" and populated mcd311Ref when SIMULATE_FAILURE=false', async () => {
    process.env.MCD311_SIMULATE_FAILURE = 'false';
    const complaints = await fetchMCD311Complaints();
    
    expect(complaints.length).toBeGreaterThan(0);
    complaints.forEach(c => {
      expect(c.source).toBe('mcd311');
      expect(c.mcd311Ref).toBeDefined();
      expect(c.mcd311Ref).toMatch(/^MCD-/);
    });
  });

  it('throws an error and system catches it when SIMULATE_FAILURE=true', async () => {
    process.env.MCD311_SIMULATE_FAILURE = 'true';
    
    await expect(fetchMCD311Complaints()).rejects.toThrow('MCD311 API Gateway Timeout');
  });
});
