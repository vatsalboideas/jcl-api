const forge = require('node-forge');

// RSA Decryption Function
const decryptRSA = (encryptedData, privateKeyPem) => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    return privateKey.decrypt(
      forge.util.decode64(encryptedData),
      'RSAES-PKCS1-V1_5'
    );
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};

// Flexible Decryption Middleware
const decryptionMiddleware = (req, res, next) => {
  try {
    // console.log('Decryption middleware', req.body);
    const privateKeyPem = process.env.RSA_PRIVATE_KEY;

    // If no encrypted data, pass through
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    // Dynamically decrypt all string values in the request body
    const decryptedBody = {};

    Object.keys(req.body.data).forEach((key) => {
      if (typeof req.body.data[key] === 'string') {
        try {
          const decryptedValue = decryptRSA(req.body.data[key], privateKeyPem);

          // Attempt to parse as JSON if possible
          try {
            decryptedBody[key] = JSON.parse(decryptedValue);
          } catch {
            decryptedBody[key] = decryptedValue;
          }
        } catch (decryptError) {
          // If decryption fails, keep original value
          decryptedBody[key] = req.body[key];
        }
      } else {
        decryptedBody[key] = req.body[key];
      }
    });

    // console.log('Decrypted body:', decryptedBody);

    // Replace request body with decrypted data
    req.body = decryptedBody;

    next();
  } catch (error) {
    console.error('Middleware decryption error:', error);
    return res.status(400).json({
      error: 'Decryption middleware failed',
      details: error.message,
    });
  }
};

module.exports = decryptionMiddleware;
