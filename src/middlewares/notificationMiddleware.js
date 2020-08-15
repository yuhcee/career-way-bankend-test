import axios from 'axios';

/**
 * // sends otp to the user for verification
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns next
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req;
    if (!email) {
      throw new Error(
        'email not attatched in request object. [req.email is undefined]'
      );
    }
    /**
     * call the sendMail method to send the OTP
     */
    const body = {
      To: req.email,
      from: process.env.MAIL_SERVICE_SENDER,
      mail_subject: 'Cybersource Registration',
      Cc: '',
      Bcc: '',
      mail_message: `Your account verification code is ${req.otp.passCode}\nThis code will expire on ${req.otp.expires}.`,
      attachement: '',
      isBodyHtml: true,
    };
    const sent = await axios.post(process.env.ESB_EMAIL_ENDPOINT1, body, {});
    const { log } = console;
    log(sent);
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const sendPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req;
    if (!email) {
      throw new Error(
        'email not attatched in request object. [req.email is undefined]'
      );
    }
    /**
     * call the sendMail method to send the OTP
     */
    const body = {
      To: req.email,
      from: process.env.MAIL_SERVICE_SENDER,
      mail_subject: 'Cybersource Reset password',
      Cc: '',
      Bcc: '',
      mail_message: `Your activation code is ${req.otp.passCode}\nThis code will expire on ${req.otp.expires}.`,
      attachement: '',
      isBodyHtml: true,
    };
    const sent = await axios.post(process.env.ESB_EMAIL_ENDPOINT1, body, {});
    const { log } = console;
    log(sent);
    return next();
  } catch (error) {
    return next(error.message);
  }
};
