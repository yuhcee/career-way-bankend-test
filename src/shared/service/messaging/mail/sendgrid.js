import sendgrid from 'sendgrid';
import { catchError } from '../../../../utils/response';

const { mail: helper } = sendgrid;

export const generateMailBody = async ({ to, subject, html, from }) => {
  const fromEmail = await new helper.Email(from);
  const toEmail = await new helper.Email(to);
  const content = await new helper.Content('text/html', html);
  return await new helper.Mail(fromEmail, subject, toEmail, content);
};
export default async ({ to, subject, html, from }) => {
  
  const fromEmail = await new helper.Email(from);
  const toEmail = await new helper.Email('ecomje@gmail.com');
  const content = await new helper.Content('text/html', html);
  
  const mail = await new helper.Mail(fromEmail, subject, toEmail, content);
  const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
  const request = await sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function (error, { statusCode }) {
    if (error) return catchError(error);
    return statusCode;
  });

};