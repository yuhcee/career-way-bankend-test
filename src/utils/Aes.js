import crypto from 'crypto';

const { AES_KEY, IV_KEY } = process.env;
const algorithm = 'aes-128-cbc';

export const encrypt = (dataToBeEncrypted) => {
  if (typeof dataToBeEncrypted !== 'string') {
    throw new Error(
      'the encryption function takes only strings as arguments; objects must be stringified before passage'
    );
  }
  if (algorithm !== 'aes-128-cbc') {
    throw new Error('aes encryption error: algorithm type must be aes-128-cbc');
  }
  const cypher = crypto.createCipheriv(algorithm, Buffer.from(AES_KEY), IV_KEY);
  const encrypted = cypher.update(dataToBeEncrypted);
  const encryptedData = Buffer.concat([encrypted, cypher.final()]);
  return encryptedData.toString('hex');
};

export const decrypt = ({ encryptedData, aesKey, ivKey }) => {
  if (algorithm !== 'aes-128-cbc') {
    throw new Error('aes encryption error: algorithm type must be aes-128-cbc');
  }
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(aesKey),
    ivKey
  );
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decrypted = decipher.update(encryptedText);
  const decryptedData = Buffer.concat([decrypted, decipher.final()]);
  return decryptedData.toString();
};

const aes = { encrypt, decrypt };
export default aes;
