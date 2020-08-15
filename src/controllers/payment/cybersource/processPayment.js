import SERVERRESPONSE from '@server_response';
import authorizePaymentProcess from '../../../shared/service/cybersource/enrollmentValidation';
import ValidateAuthEnrollmentRequest from '../../../shared/service/cybersource/enrollmentValidation';
// import services from '../service';
import visaNet from './visanetResponse';

export default {
  consumerAuth: {},
  response: false,
  next: false,
  eci: ['05', '06'],
  failed3D: ['N', '07', 'vbv_failure', 'internet'],
  authResult: ['0', '1'],
  authFailedResult: ['9', '-1', '6'],
  authFailedMsg: [
    'User failed authentication',
    'Customer prevents authentication',
    'Payer cannot be authenticated',
    'PARes signature digest value mismatch. PARes message has been modified',
    'Issuer unable to perform authentication',
  ],
  successStatus: [
    'AUTHORIZED_PENDING_REVIEW',
    'AUTHORIZED',
    'AUTHENTICATION_SUCCESSFUL',
  ],
  failedToValidateStatus: ['AUTHENTICATION_FAILED'],

  failedResponse: { success: false, data: SERVERRESPONSE.FAILED_PAYMENT },
  async authorize(paymentDetails, vendor) {
    const authorize = await authorizePaymentProcess(paymentDetails, vendor);
    console.warn('@@@@@@@@@@@ PAYMENT AUTHORIZATION @@@@@@@@@@@\n');
    
    const payment = await visaNet.cardAuthorizationStatus(authorize);
    let response = payment;
    // let status = 'FAILED';
    // if (payment.status) {
    //   // update transaction table
    //   status = 'SUCCESSFUL';
    //   response = {
    //     success: true,
    //     data: {
    //       message: SERVERRESPONSE.SUCCESSPAYMENT },
    //   };
    // }
    // const payload = Object.assign({}, paymentDetails , {status });
    // await services.successfulTransaction(payload, vendor);
    return response;
  },

  async shouldValidateCard({ skiptValidation, consumer }) {
    return !skiptValidation && (!consumer || !consumer.next);
  },

  async validateAuthentication(request) {
    const shouldValidateCard = await this.shouldValidateCard(request);
    if (shouldValidateCard) {
      const response = await ValidateAuthEnrollmentRequest(request);
      return this.shouldAuthorizePayment(response, request);
    } else {
      return request.consumer || request;
    }
  },
  async shouldAuthorizePayment(res, req) {
    const resp = (this.consumerAuth = res.consumerAuthenticationInformation);
    const status =
      !this.ThreeDsecureV2() &&
      (this.failedToValidateStatus.includes(res.status) ||
        this.authFailedResult.includes(resp?.authenticationResult) ||
        this.authFailedMsg.includes(resp?.authenticationStatusMsg));
    const xid = req?.consumer?.xid || req.xid || '';
    if ((xid && resp.xid !== xid) || status) return this.failedResponse;
    return this.consumerAuth;
  },
  ThreeDsecureV2() {
    const spec = this.consumerAuth?.specificationVersion?.split('.')[0] || '1';
    if (Number(spec) === 1) return false;
    return ['0', '6'].includes(this.consumerAuth?.authenticationResult);
  },
};
