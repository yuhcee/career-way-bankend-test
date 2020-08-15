import { verifyPaymentAbility, sendBankOtp } from './helpers';

export const reviewAcctInfo = async (req, res, next) => {
  try {
    const { error, msg, userDetails } = await verifyPaymentAbility(req.body);
    if (error) {
      return res.status(400).json({ error: msg });
    }
    // get user email/phone from userDetails and send otp (using otp helper function)
    const { e_mail, phone } = userDetails;
    await sendBankOtp(phone);
    // then return a message telling user to enter the otp which has been sent to their mail
    return res.status(200).json({ e_mail, phone, userDetails });
  } catch (error) {
    return next(`reviewAcctInfo: ${error.message}`);
  }
};
