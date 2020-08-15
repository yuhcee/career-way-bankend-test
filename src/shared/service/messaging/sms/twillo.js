import { catchError } from '../../../../utils/response';
import Twillor from './twillo';

const accountSid = process.env.TWILIOID;
const authToken = process.env.TWILIOTOKEN;
const phone = process.env.TWILIOPHONENUMBER;

const client = require('twilio')(accountSid, authToken);

const send = async (body) => {
  const sms = await generateSms(body);
  if (!sms) return catchError('Network issues: Could not send sms.');
  return await client.messages.create(sms);
};
 
export const generateSms = async (body) => {
  const sendTo = await verifyFormatPhone(body.to);
  if (!sendTo) return false;
  return {
    body: body.message,
    from: phone,
    to: sendTo
  };
};

export const verifyFormatPhone = async (num) => {
  try {
    const data = await client.lookups.phoneNumbers(num).fetch({ countryCode: 'NG' });
    return data.phoneNumber;
  } catch (error) {
    return false;
  }
};

export default send;