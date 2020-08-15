import status from 'http-status';
import server_response from '@server_response';
/**
 * Response helper function
 * @param {object} responseObject - express response object
 * @param {number} statusCode - the HTTP status code you want returned
 * @param {string} message - the message for the http status code
 * @param {object | string } dataOrError - the payload to be delivered if the request was
 * successful or the error message if it was not
 */

const response = (responseObject, statusCode, dataOrError) => {
  let x = 'data';
  let success = true;
  let payload = dataOrError;
  if (statusCode >= 400) {
    x = 'error';
    success = false;
  }
  return responseObject.status(statusCode).json({
    status: statusCode,
    message: status[statusCode],
    [x]: payload,
    success,
  });
};

// Default Error Message for invalid/missing request details

export const ErrorRequestResponse = (res) => (reason, detail) => {
  const statusCode = server_response.AUTHORIZATION_ISSUE === detail ? 402 : 400; 
  return res.status(statusCode).json({
    reason, detail,
    advice: 'Cross check the request fields or check official documentation',
    documentation: `${res.req.protocol}://${res.req.get('host')}/doc`
  });
};

export const ErrorResponse = (res) => (status, message) => {
  return res.status(status).json({ error: message });
};

export const SuccessResponse = (res) => (status, data) => {
  return res.status(status > 399 ? 400 : status).json({ success: true, data });
};

export const catchError = (error) => {
  // TODO: logging of Error goes here.
  return { status: false, error: error.message || error };
};

export const formatResponse = (response) => {
  return { status: true, response };
};

export default response;
