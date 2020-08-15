const cybersourceRestApi = require('cybersource-rest-client');
const configuration = require('./Configuration.js');

/**
 * This is a sample code to call PaymentApi,
 * createPayment method will create a new payment
 */
export default function ValidateAuthEnrollmentRequest({
  sessionId,
  amount,
  currency,
  cardDetail,
  authenticationTransactionId,
  ProcessorTransactionId,
  countryCode,
  firstName,
  lastName,
  directoryServerTransactionId,
  paresStatus,
  eciRaw,
  eci,
  xid,
  cavvAlgorithm,
  ucafCollectionIndicator,
  authenticationPath,
  specificationVersion,
  indicator,
  ecommerceIndicator,
}) {
  try {
    console.log({
      sessionId,
      amount,
      currency,
      cardDetail,
      authenticationTransactionId,
      ProcessorTransactionId,
      countryCode,
      firstName,
      lastName,
      directoryServerTransactionId,
      paresStatus,
      eciRaw,
      eci,
      xid,
      cavvAlgorithm,
      ucafCollectionIndicator,
      authenticationPath,
      specificationVersion,
      indicator,
      ecommerceIndicator,
    });
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
    consumer.authenticationTransactionId =
      authenticationTransactionId || ProcessorTransactionId;
    consumer.authenticationPath = authenticationPath;
    consumer.directoryServerTransactionId = directoryServerTransactionId;
    consumer.paresStatus = paresStatus;
    consumer.eciRaw = eciRaw;
    consumer.eci = eci;
    consumer.ucafCollectionIndicator = ucafCollectionIndicator;

    consumer.paSpecificationVersion = specificationVersion;
    consumer.indicator =
      indicator || ecommerceIndicator || ucafCollectionIndicator;
    consumer.xid = xid;
    consumer.cavvAlgorithm = cavvAlgorithm;

    const paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    card.number = cardDetail.number;
    card.expirationYear = cardDetail.expirationYear;
    card.expirationMonth = cardDetail.expirationMonth;
    card.securityCode = cardDetail.cvv;
    paymentInformation.card = card;

    const request = new cybersourceRestApi.ValidateRequest(configObject);
    request.clientReferenceInformation = clientReferenceInformation;
    request.orderInformation = orderInformation;
    request.paymentInformation = paymentInformation;
    request.consumerAuthenticationInformation = consumer;
    console.warn(
      '\n*************** Enrollment Validate *********************\n'
    );
    return new Promise((resolve, reject) => {
      console.log(request, 'requestrequest');
      instance.validateAuthenticationResults(request, function (
        error,
        data,
        response
      ) {
        if (error) {
          const errorInfo = JSON.parse(error.response.error.text);
          return reject(errorInfo);
        } else if (data) {
          console.log('\n %%%%%% SuccessFul Validate %%%%%\n');
          console.log(data);
          console.log('\n %%%%%% SuccessFul Validate %%%%%\n');

          resolve(data);
        }
        console.warn(
          '\n*************** Completed Enrollment Validate *********************\n'
        );
      });
    });
  } catch (error) {
    return error;
  }
}
// module.exports = CheckPayerAuthEnrollmentRequest;
