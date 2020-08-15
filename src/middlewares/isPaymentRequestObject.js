import { ErrorRequestResponse } from '@response';

export default (req, res, next) => {
  try {
    const { isObject, request } = req.body;
    if (typeof request === 'string'  || (!isObject && isObject !== undefined)) {
      req.body.request = JSON.parse(request);
    }
    if (!req.body.request.cardDetail) {
      throw Error('One or more Missing fields');
    }
    next();
  } catch (e) {
    ErrorRequestResponse(res)(e.message, 'Invalid request format provided for "body.request"');
  }
};