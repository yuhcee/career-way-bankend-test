const cybersourceRestApi = require('cybersource-rest-client');
const configuration = require('./Configuration.js');

/**
 * This is a sample code to call PaymentApi,
 * createPayment method will create a new payment
 */
export default function CheckPayerAuthEnrollmentRequest({
  amount,
  currency,
  cardDetail, 
  ReferenceId,
  sessionId,
  countryCode,
  firstName,
  lastName,
}, merchant) {
  try {
    const configObject = new configuration();
    const instance = new cybersourceRestApi.PayerAuthenticationApi(
      configObject
    );

    const clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = sessionId;

    const amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    amountDetails.totalAmount = amount;
    amountDetails.currency = currency || 'NGN';

    const billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    billTo.country = countryCode || 'NG';
    billTo.firstName = firstName;
    billTo.lastName = lastName;
    // billTo.phoneNumber = '08145467267';
    billTo.postalCode = '100001';
    billTo.email = process.env.DEPT_EMAIL;
    billTo.administrativeArea = 'NG';

    const orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    orderInformation.billTo = billTo;
    orderInformation.amountDetails = amountDetails;

    const consumer = new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
    consumer.referenceId = ReferenceId;

    const paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    card.number = cardDetail.number;
    card.expirationYear = cardDetail.expirationYear;
    card.expirationMonth = cardDetail.expirationMonth;
    card.securityCode = cardDetail.cvv;
    paymentInformation.card = card;

    const merchantInformation = new cybersourceRestApi.Ptsv2paymentsMerchantInformation();
    merchantInformation.merchantDescriptor = {
      name: merchant.name,
      url: merchant.url
    };
    merchantInformation.merchantName = merchant.name;

    const request = new cybersourceRestApi.CheckPayerAuthEnrollmentRequest(
      configObject
    );
    request.clientReferenceInformation = clientReferenceInformation;
    request.orderInformation = orderInformation;
    request.paymentInformation = paymentInformation;
    request.consumerAuthenticationInformation = consumer;
    request.merchantInformation = merchantInformation;
    console.warn('\n*************** Enrollment Check *********************\n');

    return new Promise((resolve, reject) => {
      instance.checkPayerAuthEnrollment(request, function (
        error,
        data,
        response
      ) {
        if (error) {
          const errorInfo = JSON.parse(error.response.error.text);
          return reject(errorInfo);
        } else if (data) {
          resolve(data);
        }
        console.warn(
          '*************** Completed Enrollment Check *********************\n'
        );
      });
    });
  } catch (error) {
    return error;
  }
}
// module.exports = CheckPayerAuthEnrollmentRequest;
