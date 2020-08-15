import response from '@response';
import logger from '@logger';
import { Enrollement, Payment } from './cybersource';

import SERVERRESPONSE from '@server_response';

const SECRET = process.env.CARDINAL_API_KEY;

/*****************************************
 * ****** check if card is enrolled in CCA
 *
 * request body format
 * -- { isObject: default:true (false means stringify), request: { ...content }}
 ******************************************/

/**
 * get account details from external source (FLEXCUBE)
 * @param {object} req - request body
 * @param {object} res - response object
 * @returns {Promise} user object or null
 */
export const enrollmentCheck = async (req, res) => {
  try {
    const { body } = Enrollement.getParams(req);
    const processPayment = await Enrollement.check(req);
    if (processPayment?.next === true) {
      // TODO: send card for validation
      let validated = await Payment.validateAuthentication({
        ...processPayment,
        ...body,
      });
      return res.json({ validated });
    }
    if (!processPayment?.next) return response(res, 200, processPayment);
    return response(res, 422, SERVERRESPONSE.CARDENROLLENTERROR);
  } catch (e) {
    logger(e);
    return response(res, 500, e.message);
  }
};
