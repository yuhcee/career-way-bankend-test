import express from 'express';
import {
  validateNewPaymentType,
  validatePaymentTypeUpdate,
} from '../../middlewares/paymentTypeMiddleware';
import { authorize } from '../../middlewares/authMiddleware';
import roles from '../../shared/security/roles';
import {
  createPaymentType,
  getAllPaymentTypes,
  updatePaymentType,
  deletePaymentType,
} from '../../controllers/paymentTypeController';
import { validateAppID } from '../../middlewares/cryptoMiddleware';
const { admin } = roles;

const router = express.Router();

router.post(
  '/',
  authorize([admin]),
  validateAppID,
  validateNewPaymentType,
  createPaymentType
);
router.get('/', validateAppID, getAllPaymentTypes);
router.patch(
  '/:id',
  authorize([admin]),
  validateAppID,
  validatePaymentTypeUpdate,
  updatePaymentType
);
router.delete('/:id', authorize([admin]), deletePaymentType);

export default router;
