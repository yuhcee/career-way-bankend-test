import sendgrid from './sendgrid';
import bankMail from './bankMail';
import { catchError } from '../../../../utils/response';

export default async ({ html, email, subject }, type = 'sendgrid') => {
  try {
    const body = {
      to: email,
      from: process.env.MAIL_SERVICE_SENDER,
      subject,
      cc: '',
      bc: '',
      mailContent: html,
      attachement: '',
      isBodyHtml: true,
    };
    const useSendGrid = ['sendgrid', '1', 1];
    if (useSendGrid.indexOf(type) !== -1) {
      return await sendgrid(body);
    }
    return await bankMail(body);
  } catch (error) {
    return catchError(error);
  }
};