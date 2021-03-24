/* eslint-disable linebreak-style */
import joi from "@hapi/joi";
import response from "@response";

/**
 * Returns a middleware function which validates the request header
 * againt a provided schema object
 * @param {Object} schemaObject - an object specifying the schema
 * to be used to validate the request body e.g {john: joi.string()}
 * @returns {Function} - express-style middleware function
 */
export const headerValidation = (schemaObject) => (req, res, next) => {
  const schema = joi.object(schemaObject).options({ stripUnknown: true });
  const { error } = schema.validate(req.headers);
  if (error) return response(res, 400, error.message);
  req.headers.usage = Object.keys(schemaObject);
  return next();
};

/**
 * Returns a middleware function which validates the request body
 * againt a provided schema object
 * @param {Object} schemaObject - an object specifying the schema
 * to be used to validate the request body e.g {john: joi.string()}
 * @returns {Function} - express-style middleware function
 */
export default (schemaObject) => (req, res, next) => {
  const schema = joi.object(schemaObject).options({ stripUnknown: true });
  const { error, value } = schema.validate({ ...req.params, ...req.body });
  if (error) return response(res, 400, error.message);
  return next();
};
