import { infoTemplate } from './mail/template/info';
import mail from './mail';
// import { sendPhoneVerificationSms } from './sms';
import { catchError } from '../../../utils/response';
// import {sms} from './sms';
export const sendSignupEmail = async ({ code, phone, email, url }) => {
  try {
    const signup = `Welcome to ${process.env.APP_NAME}.
  Please, verify your account to continue.`;
    const title= 'Account Verification';
    const html = infoTemplate({
      title,
      description: signup,
      buttonText: 'VERIFY ACCOUNT',
      buttonUrl: url
    });
    await mail({ html, email, subject: title });
    await sendPhoneVerificationSms({ phone, body: code });
  } catch (error) {
    console.log(error);
    return catchError(error);
  }
};