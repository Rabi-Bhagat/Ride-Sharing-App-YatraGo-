const crypto = require('crypto');

const SALT = 'yatrago_mobility_secure_salt_2026';

function hashPassword(password) {
  if (!password) return '';
  return crypto.pbkdf2Sync(String(password), SALT, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(inputPassword, storedHash) {
  if (!storedHash || !inputPassword) return false;
  // Support direct demo comparison or hashed comparison
  if (storedHash === inputPassword) return true;
  const computedHash = hashPassword(inputPassword);
  return computedHash === storedHash;
}

function sanitizeUser(user) {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;
  return userObj;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  // Must contain at least 7 digits
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 7;
}

// RFC 7519 Cryptographic JWT Implementation with process.env.JWT_SECRET
function generateJwtToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const secret = process.env.JWT_SECRET || 'yatrago_fallback_jwt_secret_2026';
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodeBase64Url = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(fullPayload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
}

function verifyJwtToken(token) {
  if (!token) return { valid: false, error: 'No token provided' };
  const secret = process.env.JWT_SECRET || 'yatrago_fallback_jwt_secret_2026';
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  const parts = String(cleanToken).split('.');
  if (parts.length !== 3) return { valid: false, error: 'Invalid token structure' };

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid token signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired', payload };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, error: 'Malformed token payload' };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  validateEmail,
  validatePhone,
  generateJwtToken,
  verifyJwtToken
};

