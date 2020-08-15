import axios from 'axios';
import env from '@dbconfig';
import { catchError } from '../../../../utils/response';

const { ESB_SMS_ENDPOINT } = env;


export const generate = ({ ReceiverNumber, body}) => {
  return {
    ReceiverNumber,
    SMSMessage: body,
    ApplicationId: 'CRM',
    Priority: '1',
    channel_code: 'CRM',
  };
};
const send = async ({ phone, body }) => {
  try {
    const requestBody = generate({ body, ReceiverNumber: phone });
   
    await axios({
      url: ESB_SMS_ENDPOINT,
      data: requestBody,
      method: 'POST',
    });
   
  } catch (error) {
    return catchError('Operation failed while sending sms. Please confirm mobile number');
  }
};

export default send;
