const jwt = require('jsonwebtoken');
const response = require('../helpers/response');

// Environment variables
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

// Token types
const TOKEN_TYPES = {
  READ: 'read',
  WRITE: 'write',
};

// Generate a simple access token
const generateAccessTokenInfinite = (type = TOKEN_TYPES.READ) => {
  return jwt.sign(
    {
      type,
      timestamp: Date.now(),
    },
    JWT_SECRET_KEY
    // { expiresIn: type === TOKEN_TYPES.WRITE ? '12h' : '24h' }
  );
};
// Generate a simple access token
const generateAccessToken = (type = TOKEN_TYPES.READ) => {
  return jwt.sign(
    {
      type,
      timestamp: Date.now(),
    },
    JWT_SECRET_KEY,
    { expiresIn: type === TOKEN_TYPES.WRITE ? '12h' : '24h' }
  );
};

// Verify token helper function
const verifyToken = async (token, type = TOKEN_TYPES.READ) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    console.log(`decoded`, decoded);
    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }
    return { success: true, data: decoded };
  } catch (error) {
    return {
      success: false,
      error:
        error.name === 'TokenExpiredError'
          ? 'Token has expired'
          : 'Invalid token',
    };
  }
};

// Middleware for read access
const requireReadAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.response(res, true, 401, 'Access token is required');
    }

    const verificationResult = await verifyToken(token, TOKEN_TYPES.READ);
    if (!verificationResult.success) {
      return response.response(res, true, 401, verificationResult.error);
    }

    // Add token info to request object
    req.tokenData = verificationResult.data;
    next();
  } catch (error) {
    return response.response(
      res,
      true,
      500,
      'Error processing authentication',
      error
    );
  }
};

// Middleware for write access
const requireWriteAccess = async (req, res, next) => {
  try {
    console.log(`req.headers`, req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log(`token not found`);
      return response.response(res, true, 401, 'Access token is required');
    }

    const verificationResult = await verifyToken(token, TOKEN_TYPES.WRITE);
    if (!verificationResult.success) {
      return response.response(res, true, 401, verificationResult.error);
    }

    // Check if token has write access
    if (verificationResult.data.type !== TOKEN_TYPES.WRITE) {
      return response.response(res, true, 403, 'Write access required');
    }

    // Add token info to request object
    req.tokenData = verificationResult.data;
    next();
  } catch (error) {
    return response.response(
      res,
      true,
      500,
      'Error processing authentication',
      error
    );
  }
};

// Generate new tokens
const generateTokens = () => {
  const readToken = generateAccessToken(TOKEN_TYPES.READ);
  const writeToken = generateAccessToken(TOKEN_TYPES.WRITE);
  return { readToken, writeToken };
};

const generateTokensInfinite = () => {
  const readToken = generateAccessTokenInfinite(TOKEN_TYPES.READ);
  const writeToken = generateAccessTokenInfinite(TOKEN_TYPES.WRITE);
  return { readToken, writeToken };
};

module.exports = {
  generateTokens,
  generateTokensInfinite,
  requireReadAccess,
  requireWriteAccess,
  TOKEN_TYPES,
};
