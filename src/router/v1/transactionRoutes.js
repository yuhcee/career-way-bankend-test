import express from 'express';
import acctBasedRoutes from '../../accountBasedTransaction/routes';
import {
  getAllTransactions,
  getCountByStatus,
  createTransaction,
  getExternalAggregatorTransactions,
  getExternalAggregatorTransactionStats,
  getTransactionById,
  updateTransactionById,
} from '../../controllers/transactionController';
import roles from '../../shared/security/roles';
import { validateQueryParameters } from '../../middlewares';
import {
  authorize,
  paymentAuthentication,
} from '../../middlewares/authMiddleware';
import {
  validateGroupbyQuery,
  validateTransactionUpdate,
  validateRegistrationDetails,
} from '../../middlewares/transactionMiddleware';
import { validateAppID } from '../../middlewares/cryptoMiddleware';

const router = express.Router();

const { admin } = roles;

router.get(
  '/by_external_aggregators',
  authorize([admin]),
  validateAppID,
  validateQueryParameters,
  getExternalAggregatorTransactions
);
router.get(
  '/stats/by_external_aggregators',
  authorize([admin]),
  validateAppID,
  getExternalAggregatorTransactionStats
);

router.get(
  '/',
  authorize([admin]),
  validateAppID,
  validateQueryParameters,
  getAllTransactions
);

router.get(
  '/count',
  authorize([admin]),
  validateAppID,
  validateGroupbyQuery,
  getCountByStatus
); // MIGHT BE MADE REDUNDATNT BY DATA IN ADMIN DASHBOARD CONTROLLER

/**
 * / PAYMENT APIS /
 */
router.post(
  '/',
  paymentAuthentication,
  validateRegistrationDetails,
  createTransaction
); // TO BE DISABLED. THERE SHOULD BE NO ENDPOINT FOR CREATING TRANSACTION
router.get(
  '/:transactionId',
  paymentAuthentication,
  validateQueryParameters,
  getTransactionById
); // emma payment endpoint
router.patch(
  '/:transactionId',
  paymentAuthentication,
  validateTransactionUpdate,
  updateTransactionById
);
router.use('/account_based', acctBasedRoutes);

export default router;
