import express from 'express';
import { generateOTP } from '../../middlewares/otpMiddleware';
import {
  sendOTP,
  sendPasswordOTP,
} from '../../middlewares/notificationMiddleware';
import {
  registerMerchant,
  verifyMerchantSaveMidAndCreatePassword,
  saveMerchantOtp,
  getMerchantById,
  getAllMerchants,
  approveMerchant,
  getMerchantTransactions,
  getMerchantTransactionStats,
  activateMerchant,
  deactivateMerchant,
  getPendingMerchants,
  getMerchantByApiKey,
  changeMerchantRiskLevel,
  changePasswordMerchant,
  resetMerchantPassword,
  setMerchantPercentageCharge,
  updateMerchantDetails,
  changeMerchantAggregator,
  resetMerchantEncryptionCredentials,
} from '../../controllers/merchantController';
import {
  validateMerchantDetails,
  formatMerchantReqBody,
  checkMerchantVerificationDetails,
  validateMerchantOtp,
  validateMerchantEmail,
  generateMid,
  rejectVerifiedMerchants,
  rejectUnverifiedMerchants,
  validateRiskLevel,
  validateMerchantPercentageCharge,
  validateMerchantPatchRequest,
} from '../../middlewares/merchantMiddleware';
import { loginMerchant } from '../../controllers/authController';
import {
  authorize,
  paymentAuthentication,
} from '../../middlewares/authMiddleware';
import { validateLoginDetails } from '../../middlewares/authMiddleware';
import {
  validateQueryParameters,
  verifyAccountNumber,
  validateApiKey,
  confirmAggregatorOwnsMerchant,
} from '../../middlewares';
import {
  generateEncryptionKeys,
  decryptRequestBody,
  allowOnlyAggregators,
  validateAppID,
  validateNewMerchantAGID,
} from '../../middlewares/cryptoMiddleware';
import roles from '../../shared/security/roles';

const router = express.Router();

const { merchant, aggregator, admin } = roles;

router.post(
  '/register',
  validateAppID,
  allowOnlyAggregators,
  decryptRequestBody,
  validateNewMerchantAGID,
  validateMerchantDetails,
  verifyAccountNumber,
  formatMerchantReqBody,
  generateOTP,
  generateEncryptionKeys,
  sendOTP,
  registerMerchant
);
router.post(
  '/verify',
  validateAppID,
  allowOnlyAggregators,
  decryptRequestBody,
  checkMerchantVerificationDetails,
  rejectVerifiedMerchants,
  confirmAggregatorOwnsMerchant,
  validateMerchantOtp,
  generateMid,
  verifyMerchantSaveMidAndCreatePassword
);

router.post(
  '/resend_otp',
  validateAppID,
  decryptRequestBody,
  validateMerchantEmail,
  rejectVerifiedMerchants,
  generateOTP,
  sendOTP,
  saveMerchantOtp
);

router.post(
  '/change_password',
  validateAppID,
  decryptRequestBody,
  rejectUnverifiedMerchants,
  checkMerchantVerificationDetails,
  validateMerchantOtp,
  changePasswordMerchant
);

router.post(
  '/reset_password',
  validateAppID,
  decryptRequestBody,
  validateMerchantEmail,
  rejectUnverifiedMerchants,
  generateOTP,
  sendPasswordOTP,
  resetMerchantPassword
);

router.post(
  '/login',
  validateAppID,
  decryptRequestBody,
  validateLoginDetails,
  rejectUnverifiedMerchants,
  loginMerchant
);

router.post(
  '/reset_encryption_credentials',
  validateAppID,
  decryptRequestBody,
  authorize([admin]),
  generateEncryptionKeys,
  resetMerchantEncryptionCredentials
);

// edit merchant details
router.patch(
  '/:merchantId',
  validateAppID,
  authorize([aggregator]),
  decryptRequestBody,
  validateMerchantPatchRequest,
  rejectUnverifiedMerchants,
  updateMerchantDetails
);

router.patch(
  '/:merchantId/risk_level',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateQueryParameters,
  validateRiskLevel,
  changeMerchantRiskLevel
);

router.patch(
  '/:merchantId/approve',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateQueryParameters,
  // validateRiskLevel,
  rejectUnverifiedMerchants,
  approveMerchant
);
router.patch(
  '/:merchantId/activate',
  validateAppID,
  authorize([aggregator, admin]),
  decryptRequestBody,
  validateQueryParameters,
  rejectUnverifiedMerchants,
  activateMerchant
);
router.patch(
  '/:merchantId/deactivate',
  validateAppID,
  authorize([aggregator, admin]),
  decryptRequestBody,
  validateQueryParameters,
  deactivateMerchant
);
router.patch(
  '/:merchantId/set_percentage_charge',
  validateAppID,
  authorize([aggregator]),
  decryptRequestBody,
  validateMerchantPercentageCharge,
  setMerchantPercentageCharge
);
router.patch(
  '/:merchantId/change_aggregator',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  changeMerchantAggregator
);
router.get('/', validateAppID, authorize([admin]), getAllMerchants);
router.get('/pending', validateAppID, authorize([admin]), getPendingMerchants);
router.get(
  '/:merchantId',
  validateAppID,
  authorize([merchant, aggregator, admin]),
  validateQueryParameters,
  getMerchantById
);
router.get(
  '/:merchantId/transactions',
  validateAppID,
  authorize([merchant, aggregator, admin]),
  validateQueryParameters,
  getMerchantTransactions
);
router.get(
  '/:merchantId/transactions/stats',
  validateAppID,
  authorize([merchant, aggregator, admin]),
  validateQueryParameters,
  getMerchantTransactionStats
);

router.get(
  '/apiKey/:apiKey',
  paymentAuthentication,
  validateApiKey,
  getMerchantByApiKey
);

export default router;
