import express from 'express';
import { enrollmentCheck } from '../../controllers/payment/controller';
import Validations from '../../controllers/payment/validationSchema';
import isPaymentRequestObject from '../../middlewares/isPaymentRequestObject';
import isValidMerchantApiKey from '../../middlewares/isValidMerchantApiKey';

const router = express.Router();

router.post(
  '/',
  Validations.DefaultPaymentValidate,
  Validations.EnrollmentCheckHeaderValidation,
  isValidMerchantApiKey,
  isPaymentRequestObject,
  Validations.EnrollmentCheckPaymentValidation,
  enrollmentCheck
);

export default router;
