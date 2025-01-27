const crypto = require('crypto');

// Encryption Configuration
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_KEY,
  'salt',
  32
);
const IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    ENCRYPTION_KEY,
    iv
  );
  let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  if (!text) return text;
  if (!text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      ENCRYPTION_KEY,
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return text;
  }
};

module.exports = {
  encrypt,
  decrypt,
};
