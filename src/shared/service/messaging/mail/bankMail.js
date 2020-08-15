import axios from 'axios';
import { catchError } from '../../../../utils/response';

export default async (body) => {
  try {
    return await axios.post(process.env.ESB_EMAIL_ENDPOINT1, body, {});
  } catch (err) {
    return catchError(err);
  }
};

/**
 *
 * @param {a valid email} email
 * @param {a string, could be a string literal of html} message
 */
export const sendEmailNotification = async (recipientEmail, message) => {
  const { log } = console;
  try {
    if (!recipientEmail || !message) {
      throw new Error(
        '"sendEmailNotification" expects recipient"s email and messages to be provided as arguments'
      );
    }
    const body = {
      To: recipientEmail,
      from: process.env.MAIL_SERVICE_SENDER,
      mail_subject: 'Access Gateway Registration',
      Cc: '',
      Bcc: '',
      mail_message: message,
      attachement: '',
      isBodyHtml: true,
    };
    // log(message);
    await axios.post(process.env.ESB_EMAIL_ENDPOINT1, body, {});
  } catch (error) {
    // log(error);
    return { error };
  }
};
