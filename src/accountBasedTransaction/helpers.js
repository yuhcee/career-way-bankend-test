import axios from 'axios';
const {
  GET_CUST_DETAILS_PUBLIC_URL,
  SEND_OTP,
  VERIFY_OTP,
  POSTING,
} = process.env;

export const verifyPaymentAbility = async ({ accountNumber, amount }) => {
  try {
    const endpoint = GET_CUST_DETAILS_PUBLIC_URL;
    const body = { account_no: accountNumber };
    const response = await axios.post(endpoint, body, {});
    const {
      ResponseCode,
      ResponseMessage,
      getcustomeracctsdetailsresp,
    } = response.data;
    if (ResponseCode !== '00') {
      const msg =
        ResponseMessage == 'Record Not Found'
          ? 'account number not found; only access bank account number is allowed'
          : ResponseMessage;
      return { error: true, msg, userDetails: {} };
    }

    const [userDetails] = getcustomeracctsdetailsresp;
    if (userDetails.availableBalance < amount) {
      return { error: true, msg: 'insufficient balance', userDetails };
    }

    return {
      error: false,
      msg: 'user exists and has sufficient balance',
      userDetails,
    };
  } catch (error) {
    throw new Error(`error while fetching account details ${error.message}`);
  }
};

export const sendBankOtp = async (phone) => {
  try {
    const endpoint = SEND_OTP;
    const body = { phoneNumber: phone };
    const headers = { 'content-type': 'application/json' };
    const response = await axios.post(endpoint, body, { headers });
    // console.log(response);
  } catch (error) {
    // console.log(error);
    throw new Error(
      `error while sending otp for account-based payment: ${error.message}`
    );
  }
};
