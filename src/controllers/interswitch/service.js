var Interswitch = require('interswitch');
var clientId = 'IKIACA67D931869E40BE07EE418A0B07A4A6D9EEF588';
var secret = 'y0FISAGAS+OSIASec5Cts/khsWVXaWCoxZcLF2d8o/A=';
var ENV = 'SANDBOX'; // or PRODUCTION
var interswitch = new Interswitch(clientId, secret, ENV);

/**
 * The Purchase API is designed to send payment requests to debit customer’s payment instrument and send a notification to merchants
 * about a payment that has just been made
 *
 * @param {*pan} Payment Card
 * @param {*expDate} Payment Card Expiry Date. Format YYMM
 * @param {*cvv} Payment Card CVV
 * @param {*pin} Payment Card PIN
 * @param {*amt} Payment Card amount
 */

const processPurchase = (data, callback) => {
  var custId = 'customer@myshop.com';
  const { pan, expDate, cvv, pin, amt } = data;

  var id = '098faadf7228'; // you can use any uuid library of your choice
  var paymentReqRef = 'ISW-SDK-PAYMENT-' + id;
  var auth = { pan, expDate, cvv, pin };
  var authData = interswitch.getAuthData(auth);
  var req = {
    amount: amt,
    customerId: custId,
    transactionRef: paymentReqRef,
    authData: authData,
    currency: 'NGN',
  };
  var obj = {
    url: 'api/v3/purchases',
    method: 'POST',
    requestData: req,
    httpHeaders: { 'Content-Type': 'application/json' },
  };
  //send the actual request
  interswitch.send(obj, function (error, response, body) {
    if (error?.response) {
      const details = error?.response?.body?.details?.map((err) => {
        const thisError = err.field.split('.');
        return err.reason + ' ' + thisError[thisError.length - 1];
      });
      callback(
        {
          response: { ...error.response.body, details },
          status: error.status,
        },
        body,
        response
      );
      console.warn('\n Error: ', Object.keys(error?.response?.body), '\n');
    } else {
      callback(error, body, response);
    }
  });
};

module.exports = processPurchase;
