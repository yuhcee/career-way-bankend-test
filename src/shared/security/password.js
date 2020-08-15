// const bcrypt = require('bcrypt');
const crypto = require('crypto');

// export async function hash(password) {
//   try {
//     const salt = Math.floor(Math.random() * Math.floor(10));
//     const generatedSalt = await bcrypt.genSalt(salt);
//     const hashedPassword = await bcrypt.hash(password, generatedSalt);
//     return { hash: hashedPassword, salt };
//   } catch (error) {
//     // console.log(new Error('error hashing password'));
//     throw new Error('error hashing password');
//   }
// }

export const encrypt = (input) => {
  const base64 = 'base64';
  const utf = 'utf-8';
  const sha = 'sha1';
  const algorithm = 'aes-128-ecb';
  const pass = '';
  const key = 'ACCESSAMS';
  const getKey = (key) => {
    let encodeKey = crypto.createHash(sha).update(key, utf).digest();
    encodeKey = encodeKey.slice(0, 16);
    return encodeKey;
  };
  try {
    let cipher = crypto.createCipheriv(algorithm, getKey(key), pass);
    return cipher.update(input, utf, base64) + cipher.final(base64);
  } catch (err) {
    return err;
  }
};

// module.exports = { hash };
