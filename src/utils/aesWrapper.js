import crypto from 'crypto';
// get list of supportable encryption algorithms
export const getAlgorithmList = () => {
  return crypto.getCiphers();
};
export const generateKey = () => {
  return crypto.randomBytes(32);
};
export const generateIv = () => {
  return crypto.randomBytes(16);
};
// separate initialization vector from message
export const separateVectorFromData = (data) => {
  let iv = data?.slice(-24);
  let message = data?.substring(0, data.length - 24);
  return {
    iv: iv,
    message: message
  };
};
// separate initialization vector from message
export const separateKeyFromData = (data, length) => {
  let key = data?.slice(0, length);
  let message = data?.substring(length, data.length);
  return {
    key,
    message
  };
};
export const encrypt = (key, iv, text) => {
  let encrypted = '';
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  encrypted += cipher.update(Buffer.from(text), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};
export const decrypt = (key, text) => {
  if (typeof text !== 'string' || !text) throw Error('Empty encryption');
  let dec = '';
  let data = separateVectorFromData(text);
  let cipher = crypto.createDecipheriv('aes-256-cbc',  Buffer.from(key, 'base64'), Buffer.from(data.iv, 'base64'));
  dec += cipher.update(Buffer.from(data.message, 'base64'), 'base64', 'utf8');
  dec += cipher.final('utf8');
  return dec;
};
// add initialization vector to message
export const addIvToBody = (iv, encryptedBase64) => {
  encryptedBase64 += iv.toString('base64');
  return encryptedBase64;
};
export const createAesMessage = (aesKey, message) => {
  let aesIv = generateIv();
  let encryptedMessage = encrypt(aesKey, aesIv, JSON.stringify(message));
  encryptedMessage = addIvToBody(aesIv, encryptedMessage);
  return encryptedMessage;
};


