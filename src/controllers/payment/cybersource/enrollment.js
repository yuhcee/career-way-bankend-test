import CheckPayerAuthEnrollmentRequest from '../../../shared/service/cybersource/enrollmentCheck';
import errorHandler from './errorHandler';

export default {
  valid: ['AUTHENTICATION_SUCCESSFUL', 'PENDING_AUTHENTICATION'],
  consumerAuth: {},
  response: false,
  next: undefined,
  cardType: null,
  eci: ['05', '06', '01'],
  failed3D: ['N', '07', 'vbv_failure', 'internet'],
  authResult: ['0', '1'],
  successAlternativePath: [
    'ATTEMPTS_COMPLETE',
    'NOREDIRECT',
    'AUTHENTICATION_SUCCESSFUL',
    'PENDING_AUTHENTICATION',
  ],
  failedStatus: [
    'AUTHENTICATION_FAILED',
    'INVALID_REQUEST',
    'INVALID_MERCHANT_CONFIGURATION',
  ],
  authFailedMsg: [
    'User failed authentication',
    'Customer prevents authentication',
    'Payer cannot be authenticated',
    'Encountered a Payer Authentication problem. Payer could not be authenticated.',
    'PARes signature digest value mismatch. PARes message has been modified',
    'Issuer unable to perform authentication',
  ],
  getParams(req) {
    return {
      body: {
        ...req.body.request,
        sessionId: req.headers['session-id'],
      },
      merchant: {
        name: req.body.merchant.companyName,
        url: req.body.merchant.websiteLink,
      },
    };
  },
  async check(req) {
    const { body, merchant } = this.getParams(req);
    errorHandler.validCardType(body.cardDetail.number);
    const response = await CheckPayerAuthEnrollmentRequest(body, merchant);
    
    // throws an error if there is an error; 
    errorHandler.getError(response); 

    this.consumerAuth = Object.assign(
      response.consumerAuthenticationInformation,
      { error: response?.errorInformation, status: response.status }
    );
    // TODO: you need to seperate mastercard and visa card processing
    return this.visaCard(); 
  },
  /**
   * Enrollment Handler
   */
  async visaCard() {
    const otpScreen = this.getOTPScreen();
    if (otpScreen && this.response) {
      return this.consumerAI;
    }
    return this.checkPossibleSuccessState();
  }, 

  /**
   * Enrollment Handler
   */
  async validateResponse() {
    const otpScreen = this.getOTPScreen();
    if (otpScreen && this.response) {
      return this.consumerAuth;
    }
    return this.checkPossibleSuccessState();
  },

  /**
   * default success handler. 5200000000000064
   * this check is important if an OTP screen is needed
   */
  async getOTPScreen() {
    const { acsUrl, pareq, xid, acsTransactionId } = this.consumerAuth;
    if (
      typeof (acsUrl && pareq) !== 'undefined' &&
      acsUrl &&
      pareq &&
      (xid || acsTransactionId) &&
      acsUrl.length &&
      pareq.length
    ) {
      this.response = true;
      return this.consumerAuth;
    }
    this.response = false;
    return false;
  },

  async checkPossibleSuccessState() {
    this.ThreeDsecureV2();
    this.visa3Ds2FailedFrictionless();
    this.visa3Ds2UnavailableFrictionless();
    this.visa3Ds2Frictionless();
    const isUnavailableS = await this.visaIsUnavailableAuthSuccess();
    const isNotEnrolledS = await this.visaIsNotEnrolledSuccess();
    this.visa3Ds2AttemptsProcessing();
    const isPassNotVisaS = await this.master3DsPassNotEnrolled();

    if (this.failedStatus.includes(this.consumerAuth?.error?.reason)) {
      return false;
    }
    if (
      this.successAlternativePath.includes(this.consumerAuth.status) ||
      this.response ||
      isUnavailableS ||
      isNotEnrolledS ||
      isPassNotVisaS
    ) {
      this.consumerAuth.next = true;
      return this.consumerAuth;
    }
    return false;
  },
  /**
   * Enrolled Response handler
   */
  async visaIsUnavailableAuthSuccess() {
    const {
      authenticationPath,
      eci,
      proofXml,
      ecommerceIndicator,
    } = this.consumerAuth;
    const validPaths = this.successAlternativePath.includes(authenticationPath);
    return (
      (eci || validPaths) && proofXml && typeof ecommerceIndicator === 'string'
    );
  },
  async visaIsNotEnrolledSuccess() {
    const {
      authenticationPath,
      proofXml,
      ecommerceIndicator,
      eci,
    } = this.consumerAuth;
    const eInd = ['vbv_attempted', 'spa'].includes(ecommerceIndicator);
    const validPaths = this.successAlternativePath.includes(authenticationPath);

    return this.eci.includes(eci) && validPaths && eInd && proofXml;
  },

  async visa3Ds2Frictionless() {
    const {
      veresEnrolled,
      paresStatus,
      eci,
      eciRaw,
      ecommerceIndicator,
      xid,
      cavv,
    } = this.consumerAuth;
    const pStatus = ['Y', 'A'].includes(paresStatus) && veresEnrolled === 'Y';
    const indicator = ['vbv', 'vbv_attempted'].includes(ecommerceIndicator);
    const eciSuccess =
      this.eci.includes(eciRaw) && this.eci.includes(eci) && eci === eciRaw;
    if (eciSuccess && xid && cavv && indicator && pStatus) {
      this.next = true;
      this.response = true;
    }
  },
  async visa3Ds2FailedFrictionless() {
    const { paresStatus, eciRaw } = this.consumerAuth;
    const status =
      this.failed3D.includes(paresStatus) && this.failed3D.includes(eciRaw);
    if (status) {
      this.response = false;
      this.next = false;
    }
  },

  async visa3Ds2UnavailableFrictionless() {
    const {
      paresStatus,
      eciRaw,
      ecommerceIndicator,
      veresEnrolled,
    } = this.consumerAuth;
    const status =
      this.failed3D.includes(ecommerceIndicator) &&
      this.failed3D.includes(eciRaw) &&
      paresStatus === 'U' &&
      veresEnrolled === 'Y';
    if (status) {
      this.response = true;
      this.next = true;
    }
  },

  async visa3Ds2UnavailableOnLookup() {
    const {
      paresStatus,
      eciRaw,
      ecommerceIndicator,
      veresEnrolled,
    } = this.consumerAuth;
    const status =
      this.failed3D.includes(ecommerceIndicator) &&
      this.failed3D.includes(eciRaw) &&
      paresStatus === 'U' &&
      veresEnrolled === 'Y';
    if (status) {
      this.response = true;
      this.next = true;
    }
  },

  async visa3Ds2AttemptsProcessing() {
    const {
      paresStatus,
      eciRaw,
      eci,
      veresEnrolled,
      ecommerceIndicator,
      authenticationPath,
      xid,
      cavvAlgorithm,
      cavv,
      status,
    } = this.consumerAuth;
    const resp =
      this.successAlternativePath.includes(authenticationPath || status) &&
      ['vbv_attempted', 'spa', 'internet', 'vbv'].includes(ecommerceIndicator);
    if (resp && xid && (cavvAlgorithm || cavv)) {
      this.response = true;
      this.next = true;
    }
    return { paresStatus, eciRaw, eci, veresEnrolled };
  },

  /**
   * Timeout handler
   */
  async visa3Ds1FailedTimeOut() {},
  async visa3Ds1SuccessTimeOut() {},
  async visa3Ds2FailedTimeOut() {},
  async visa3Ds2SuccessTimeOut() {},

  /**
   * Not Enrolled handler
   */
  async master3DsPassNotEnrolled() {
    if (
      this.cardType &&
      this.cardType !== 'visa' &&
      this.allowedCards.includes(this.cardType) &&
      this.master3Ds1SuccessNotEnrolledq()
    ) {
      this.next = true;
      this.response = true;
      return true;
    }
    return false;
  },
  async master3Ds1SuccessNotEnrolledq() {
    const len = Object.keys(this.consumerAuth).length;
    const {
      authenticationPath,
      ecommerceIndicator,
      proofXml,
      ucafCollectionIndicator,
    } = this.consumerAuth;
    return (
      authenticationPath === 'NOREDIRECT' ||
      (len === 3 &&
        ucafCollectionIndicator === 0 &&
        proofXml &&
        proofXml !== '' &&
        ['internet', 'spa'].includes(ecommerceIndicator))
    );
  },
  ThreeDsecureV2() {
    const spec = this.consumerAuth?.specificationVersion?.split('.')[0] || '1';
    if (Number(spec) === 1) return false;
    return this.Ds2SuccessNotEnrolled();
  },
  Ds2SuccessNotEnrolled() {
    const {
      paresStatus,
      eci,
      veresEnrolled,
      eciRaw,
      ucafCollectionIndicator,
    } = this.consumerAuth;
    if (
      ['07', '01', '00', 0].includes(
        eciRaw || eci || ucafCollectionIndicator
      ) &&
      (paresStatus === 'U' || !paresStatus) &&
      (!veresEnrolled || ['Y', 'B'].includes(veresEnrolled))
    ) {
      this.response = true;
    }
  },
};
