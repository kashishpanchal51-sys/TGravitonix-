const crypto = require('crypto');
const config = require('../../config/config');

const CLEARANCE_LEVELS = {
  'LEVEL_1_CITIZEN': 1,
  'LEVEL_2_FELLOW': 2,
  'LEVEL_3_RESIDENT': 3,
  'LEVEL_4_COMMAND': 4,
  'LEVEL_5_DIRECTOR': 5
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + config.JWT_SECRET).digest('hex');
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (config.TOKEN_EXPIRY_HOURS * 3600);
  
  const body = {
    ...payload,
    iat: now,
    exp: exp
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  
  const signature = crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return req.headers['x-gravitonix-clearance'] || null;
}

function authenticate(req) {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  CLEARANCE_LEVELS,
  hashPassword,
  generateToken,
  verifyToken,
  authenticate,
  extractToken
};
