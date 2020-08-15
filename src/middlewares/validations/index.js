import { ErrorRequestResponse } from '@response';
import Joi from '@hapi/joi';
export const Validate = async (schema, req, res, next) => {
  try {
    await schema.validateAsync({
      ...req.body,
      ...req.query,
      ...req.params,
    });
    next();
  } catch (error) { 
    ErrorRequestResponse(res)(error.message, 'Invalid request format provided for "body.request"');
  }
};

export const ValidateHeader = async (schemaObject, req, res, next) => {
  try {
    const schema = schemaObject.options({ stripUnknown: true });
    await schema.validateAsync(req.headers);
    next();
  } catch (error) { 
    ErrorRequestResponse(res)(error.message, 'Invalid request format provided for "request.headers"');
  }
};
