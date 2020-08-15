import SERVERRESPONSE from '@server_response';
import errorHandler from './errorHandler';

export default {
  consumerAI: {},
  response: false,
  next: false,
  codes: [831000, 831001],
  status: ['AUTHORIZED_PENDING_REVIEW', ''],
  successResponse() {
    return { status: true, data: this.consumerAI };
  },
  failedResponse(error) {
    let data =
      error[0].message || error[1].rmsg || SERVERRESPONSE.FAILED_PAYMENT;
    return { status: false, data };
  },
  async cardAuthorizationStatus(response) {
    this.consumerAI = response;
    if (response.status !== 'AUTHORIZED')
      return errorHandler.getAuthError(response);
    return this.successResponse();
  },
  hasSimilarValues(arrObj, flatObj) {
    return arrObj.find((obj) => {
      const keys = Object.keys(obj).find((key) => obj[key] === flatObj[key]);
      return keys;
    });
  },
  formatResponseBody() {
    const mergedObject = Object.assign(
      this.consumerAI,
      this.consumerAI.paymentInformation,
      this.consumerAI.processorInformation,
      this.consumerAI.processorInformation?.avs,
      this.consumerAI.processorInformation?.cardVerification,
      this.consumerAI.processorInformation?.merchantAdvice,
      this.consumerAI.orderInformation
    );
    return mergedObject;
  },
  ThreeDsecureV2() {
    const spec = this.consumerAI?.specificationVersion?.split('.')[0] || '1';
    if (Number(spec) === 1) return false;
    return ['0', '6'].includes(this.consumerAI?.authenticationResult);
  },
};
