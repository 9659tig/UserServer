import { internalAuth } from '../../src/middleware/internalAuth';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/config/secret', () => ({
  SEARCH_CONFIG: { INTERNAL_SYNC_TOKEN: 'test-secret-token' },
}));

function mockReqRes(token?: string) {
  const req = { headers: { 'x-internal-token': token } } as unknown as Request;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('internalAuth', () => {
  it('should pass with valid token', () => {
    const { req, res, next } = mockReqRes('test-secret-token');
    internalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject with invalid token', () => {
    const { req, res, next } = mockReqRes('wrong-token');
    internalAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject with missing token', () => {
    const { req, res, next } = mockReqRes(undefined);
    internalAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
