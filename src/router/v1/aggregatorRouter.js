import express from 'express';
import { generateOTP } from '../../middlewares/otpMiddleware';
import {
  sendOTP,
  sendPasswordOTP,
} from '../../middlewares/notificationMiddleware';
import roles from '../../shared/security/roles';
import {
  validateAggregatorDetails,
  validateAggregatorEmail,
  formatAggregatorReqBody,
  checkAggregatorVerificationDetails,
  validateAggregatorOtp,
  rejectVerifiedAggregators,
  rejectUnverifiedAggregators,
  validateAggregatorPatchRequest,
  validateAggregatorPercentageCharge,
} from '../../middlewares/aggregatorMiddleware';
import {
  registerAggregator,
  saveAggregatorOtp,
  verifyAggregatorAndCreatePassword,
  getAggregatorById,
  getAllAggregators,
  approveAggregator,
  getAggregatorTransactions,
  getAggregatorMerchants,
  getAggregatorTransactionStats,
  getPendingAggregators,
  activateAggregator,
  deactivateAggregator,
  getAggregatorBasicInfo,
  resetAggregatorPassword,
  changePasswordAggregator,
  updateAggregatorDetails,
  setAggregatorPercentageCharge,
  resetAggregatorEncryptionCredentials,
} from '../../controllers/aggregatorController';
import { loginAggregator } from '../../controllers/authController';
import {
  validateLoginDetails,
  authorize,
} from '../../middlewares/authMiddleware';
import {
  validateQueryParameters,
  verifyAccountNumber,
  verifyAccessAccountNumber,
} from '../../middlewares';
import {
  generateEncryptionKeys,
  decryptRequestBody,
  validateAppID,
} from '../../middlewares/cryptoMiddleware';

const router = express.Router();

const { aggregator, admin } = roles;

router.post(
  '/register',
  validateAppID,
  decryptRequestBody,
  validateAggregatorDetails,
  verifyAccessAccountNumber,
  rejectVerifiedAggregators,
  formatAggregatorReqBody,
  generateOTP,
  generateEncryptionKeys,
  sendOTP,
  registerAggregator
);

router.post(
  '/verify',
  validateAppID,
  decryptRequestBody,
  checkAggregatorVerificationDetails,
  rejectVerifiedAggregators,
  validateAggregatorOtp,
  verifyAggregatorAndCreatePassword
);

router.post(
  '/change_password',
  validateAppID,
  decryptRequestBody,
  rejectUnverifiedAggregators,
  checkAggregatorVerificationDetails,
  validateAggregatorOtp,
  changePasswordAggregator
);

router.post(
  '/resend_otp',
  validateAppID,
  decryptRequestBody,
  validateAggregatorEmail,
  rejectVerifiedAggregators,
  generateOTP,
  sendOTP,
  saveAggregatorOtp
);

router.post(
  '/reset_password',
  validateAppID,
  decryptRequestBody,
  validateAggregatorEmail,
  rejectUnverifiedAggregators,
  generateOTP,
  sendPasswordOTP,
  resetAggregatorPassword
);

router.post(
  '/login',
  validateAppID,
  decryptRequestBody,
  validateLoginDetails,
  rejectUnverifiedAggregators,
  loginAggregator
);

router.post(
  '/reset_encryption_credentials',
  validateAppID,
  decryptRequestBody,
  authorize([admin]),
  generateEncryptionKeys,
  resetAggregatorEncryptionCredentials
);

// edit aggregator details
router.patch(
  '/:aggregatorId',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateAggregatorPatchRequest,
  rejectUnverifiedAggregators,
  updateAggregatorDetails
);

// set aggregator's percentage charge
router.patch(
  '/:aggregatorId/set_percentage_charge',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateAggregatorPercentageCharge,
  setAggregatorPercentageCharge
);

router.patch(
  '/:aggregatorId/approve',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateQueryParameters,
  rejectUnverifiedAggregators,
  approveAggregator
);
router.patch(
  '/:aggregatorId/activate',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateQueryParameters,
  activateAggregator
);
router.patch(
  '/:aggregatorId/deactivate',
  validateAppID,
  authorize([admin]),
  decryptRequestBody,
  validateQueryParameters,
  deactivateAggregator
);
router.get('/', validateAppID, authorize([admin]), getAllAggregators);
router.get(
  '/pending',
  validateAppID,
  authorize([admin]),
  getPendingAggregators
);
router.get(
  '/:aggregatorId',
  validateAppID,
  authorize([aggregator, admin]),
  validateQueryParameters,
  getAggregatorById
);
router.get(
  '/:aggregatorId/basic_info',
  validateAppID,
  validateQueryParameters,
  getAggregatorBasicInfo
);
router.get(
  '/:aggregatorId/transactions',
  validateAppID,
  authorize([aggregator, admin]),
  validateQueryParameters,
  getAggregatorTransactions
);
router.get(
  '/:aggregatorId/transactions/stats',
  validateAppID,
  authorize([aggregator, admin]),
  validateQueryParameters,
  getAggregatorTransactionStats
);
router.get(
  '/:aggregatorId/merchants',
  validateAppID,
  authorize([aggregator, admin]),
  validateQueryParameters,
  getAggregatorMerchants
);

export default router;
