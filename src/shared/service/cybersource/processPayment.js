const cybersourceRestApi = require('cybersource-rest-client');
// const filePath = path.resolve();
const configuration = require('./Configuration.js');

/**
 * This is a sample code to call PaymentApi,
 * createPayment method will create a new payment
 */
export default function authorizePaymentProcess(
  {
    cardDetail, 
    amount,
    firstName,
    lastName,
    countryCode,
    currency,
    spTransactionId,
    sessionId,
    indicator,
    directoryServerTransactionId,
    eciRaw,
    paresStatus,
    specificationVersion,
    ucafAuthenticationData,
    ucafCollectionIndicator,
    authenticationTransactionId,
    threeDSServerTransactionId,
    acsTransactionId,
    xid,
    eci,
    cavv,
    cavvAlgorithm,
    ecommerceIndicator,
  },
  merchant
) {
  try {
    console.dir('inside payment process====');
    const configObject = new configuration();
    const instance = new cybersourceRestApi.PaymentsApi(configObject);

    const billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();

    const clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = sessionId;
    clientReferenceInformation.transactionId = spTransactionId;

    const processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();

    const orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();

    const paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();

    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();

    const amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();

    const subMerchant = new cybersourceRestApi.Ptsv2paymentsAggregatorInformationSubMerchant();
    subMerchant.id = merchant?.mid;
    subMerchant.country = 'NG';
    subMerchant.phoneNumber = merchant?.phoneNumber || merchant?.phone;
    subMerchant.address1 = merchant?.address || 'Access Bank';
    subMerchant.postalCode = '94043';
    subMerchant.locality = 'Lagos Nigeria';
    subMerchant.name = merchant?.companyName;
    subMerchant.administrativeArea = 'CA';
    subMerchant.region = 'PEN';
    subMerchant.email = merchant?.email ;
    const aggregatorInformation = new cybersourceRestApi.Ptsv2paymentsAggregatorInformation();

    processingInformation.commerceIndicator =
      indicator || ecommerceIndicator || ucafCollectionIndicator;
    console.dir('\n*************** Init ConsumerAuth *********************\n');
    processingInformation.capture = true;

    const consumerAuthenticationInformation = new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
    consumerAuthenticationInformation.directoryServerTransactionId = directoryServerTransactionId;
    consumerAuthenticationInformation.paresStatus = paresStatus;
    consumerAuthenticationInformation.eciRaw = eciRaw;
    consumerAuthenticationInformation.eci = eci;
    consumerAuthenticationInformation.ucafCollectionIndicator = ucafCollectionIndicator;

    consumerAuthenticationInformation.paSpecificationVersion = specificationVersion;
    consumerAuthenticationInformation.indicator =
      indicator || ecommerceIndicator || ucafCollectionIndicator;
    consumerAuthenticationInformation.xid = xid;
    consumerAuthenticationInformation.cavvAlgorithm = cavvAlgorithm;

    // Check for visa card
    consumerAuthenticationInformation.cavv = cavv;
    consumerAuthenticationInformation.ucafAuthenticationData = ucafAuthenticationData;
    consumerAuthenticationInformation.threeDSServerTransactionId = threeDSServerTransactionId;
    consumerAuthenticationInformation.acsTransactionId = acsTransactionId;
    consumerAuthenticationInformation.authenticationTransactionId = authenticationTransactionId;
    consumerAuthenticationInformation.paresStatus = paresStatus;

    aggregatorInformation.subMerchant = subMerchant;
    aggregatorInformation.name = 'V-Internatio';
    // aggregatorInformation.aggregatorId = 'accessbank_socialpay';

    console.dir('\n*************** Init BillTo *********************\n');
    
    billTo.country = countryCode || 'US';
    billTo.firstName = firstName || 'Noreal';
    billTo.lastName = lastName || 'Name';
    billTo.state = 'CA';
    billTo.locality = '1295 Charleston Rd';
    billTo.address1 = '1295 Charleston Rd';
    billTo.postalCode = '94105';
    billTo.email = 'null@cybersource.com';
    billTo.city = 'Mountain View';
    billTo.administrativeArea = 'CA';

    console.dir('*************** Init AmountInfo *********************\n');
    amountDetails.totalAmount = amount + '';
    amountDetails.currency = currency || 'NGN';

    console.dir('*************** Init CardInfo *********************\n');
    card.expirationYear = cardDetail.expirationYear + '';
    card.number = cardDetail.number + '';
    card.expirationMonth = cardDetail.expirationMonth + '';
    card.securityCode = cardDetail.cvv + '';
    paymentInformation.card = card;

    console.dir('*************** Init OrderInfo *********************\n');
    orderInformation.amountDetails = amountDetails;
    orderInformation.billTo = billTo;

    console.dir('*************** Init Request *********************\n');
    const request = new cybersourceRestApi.CreatePaymentRequest();
    request.clientReferenceInformation = clientReferenceInformation;
    request.processingInformation = processingInformation;
    request.aggregatorInformation = aggregatorInformation;
    request.orderInformation = orderInformation;
    request.paymentInformation = paymentInformation;
    request.consumerAuthenticationInformation = consumerAuthenticationInformation;
    console.dir('\n*************** Process Payment *********************\n');
    return new Promise((resolve, reject) => {
      instance.createPayment(request, function (error, data) {
        if (error?.response) {
          const details = error?.response?.body?.details?.map((err) => {
            const thisError = err.field.split('.');
            return err.reason + ' ' + thisError[thisError.length - 1];
          });
          console.log('\n %%%%%% Error Paymment %%%%%\n');
          console.log(error);
          console.log('\n %%%%%% Error Paymment %%%%%\n');
          reject({
            response: { ...error.response.body, details },
            status: error.status,
          });
        } else {
          console.log('\n %%%%%% SuccessFul Paymment %%%%%\n');
          console.log(data);
          console.log('\n %%%%%% SuccessFul Paymment %%%%%\n');
          resolve(data);
        }
        console.dir(
          '*************** Payment Process Complete *********************\n'
        );
      });
    });
  } catch (error) {
    return error;
  }
}
