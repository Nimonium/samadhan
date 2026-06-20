import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import * as auth from '../lib/auth';

jest.mock('../lib/auth', () => ({
  verifyAccessToken: jest.fn()
}));

describe('RBAC Middleware Boundaries', () => {
  const createReq = (pathname: string, token: string | null = 'valid_token') => {
    const req = new NextRequest(`http://localhost:3000${pathname}`);
    if (token) {
      req.cookies.set('access_token', token);
    }
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Citizen token -> officer route -> 403', async () => {
    (auth.verifyAccessToken as jest.Mock).mockResolvedValue({ userId: '1', role: 'citizen' });
    const req = createReq('/api/officer/dashboard');
    const res = await middleware(req);
    expect(res?.status).toBe(403);
  });

  it('Officer token -> CM route -> 403', async () => {
    (auth.verifyAccessToken as jest.Mock).mockResolvedValue({ userId: '2', role: 'officer' });
    const req = createReq('/api/cm/dashboard');
    const res = await middleware(req);
    expect(res?.status).toBe(403);
  });

  it('No token -> any protected route -> 401', async () => {
    const req = createReq('/api/complaints', null);
    const res = await middleware(req);
    expect(res?.status).toBe(401);
  });

  it('CM token -> CM route -> 200 (NextResponse.next() called)', async () => {
    (auth.verifyAccessToken as jest.Mock).mockResolvedValue({ userId: '3', role: 'cm' });
    const req = createReq('/api/cm/dashboard');
    const res = await middleware(req);
    // NextResponse.next() returns a response without a 401/403 status explicitly set in this context
    expect(res?.status).toBe(200);
  });

  it('Officer token -> own department complaints -> 200', async () => {
    (auth.verifyAccessToken as jest.Mock).mockResolvedValue({ userId: '2', role: 'officer', department: 'dept1' });
    const req = createReq('/api/officer/dashboard');
    const res = await middleware(req);
    expect(res?.status).toBe(200);
  });

  // Note: "Officer token -> different department complaints -> 403" is handled in the API Route, not middleware.
  // Middleware just injects headers. The test for this will be inside the state machine or handler tests.
});
