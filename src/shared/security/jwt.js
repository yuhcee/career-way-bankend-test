import jwt from 'jsonwebtoken';
// import roles from './roles';
const { JWT_SECRET } = process.env;

const generateToken = (payload) => {
  const options = { expiresIn: '100d' };
  return jwt.sign(payload, JWT_SECRET, options);
};

export default { generateToken };
