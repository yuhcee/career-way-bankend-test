import { catchError } from '../../../../utils/response';
import sendBankSMS from './bankSMS';
import sendTwilloSMS from './twillo';
import { accountVerification } from './template';
const send = async ({ phone, body, countryCode }, type = 'twillo') => {
  try {
    phone = `+${countryCode || '234'}${Number(phone)}`;
    const useTwillo = ['twillo', '1', 1];
    if (useTwillo.indexOf(type) !== -1) {
      return await sendTwilloSMS({ phone, body });
    }
    return await sendBankSMS({phone, body});
  } catch (error) {
    return catchError(error);
  }
};

export const sendPhoneVerificationSms = async ({ to, code }) => {
  return await send({ phone: to, body: accountVerification(code) });
};

export default send;