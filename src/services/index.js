import { compare, hash } from '../utils/password';
import * as jwt from '../utils/jwt';
import db from '@models';

/**
 *
 * @param {object} user - user object to be created
 * @returns {object | false} - returns the user object details on success or false on failure
 */
export const register = async (userProfile) => {
  try {
    const { firstName, lastName, email, password } = userProfile;

    // Check if user already exists
    const userExists = await db.User.findOne({
      where: {
        email,
      },
    });
    if (userExists)
      return { error: true, message: 'User already exists.', status: 400 };
    // Hash password
    const hashedPassword = await hash(password);
    // create user profile
    const user = await db.User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // create user token
    user.dataValues.token = await jwt.create({
      email: user.email,
      id: user.id,
    });
    delete user.dataValues.password;

    if (process.env.NODE_ENV === 'test')
      return { id: user.id, firstName, lastName, email };
    return user;
  } catch (error) {
    return { message: error.message, status: 400 };
  }
};

/**
 *
 * @param {string} email - user email
 * @param {string} password - user password
 * @returns {object | false} - returns the user object details on success or false on failure
 */
export const signIn = async (email, password) => {
  try {
    const user = await db.User.findOne({
      where: {
        email,
      },
      attributes: {
        include: ['password'],
      },
    });
    if (!user) return { error: true, message: 'Invalid email or password.' };

    const passwordMatch = await compare(password, user.password);
    if (passwordMatch) {
      const token = await jwt.create({
        email: user.email,
        id: user.id,
      });

      user.dataValues.token = token;
      delete user.dataValues?.password;
      return user;
    }
    return { error: true, message: 'Invalid email or password.' };
  } catch (error) {
    throw Error(error);
  }
};

/**
 * get User details using id
 * @param {string} UserId - the id to search
 * @returns {Promise} vendor object or null
 */
export const getUserById = async (id) => {
  if (id === null) return null;
  try {
    const user = await db.User.findOne({
      where: {
        id,
      },
    });
    // if (!user) return { error: true, message: 'User does not exist.' };
    return user;
  } catch (error) {
    throw Error(`Error fetching user ${error}`);
  }
};
