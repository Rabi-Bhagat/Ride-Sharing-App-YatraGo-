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

module.exports = {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  validateEmail,
  validatePhone
};

