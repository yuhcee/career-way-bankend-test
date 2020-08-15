import express from 'express';

import {
  authorize,
  validateAdminLoginDetails,
} from '../../middlewares/authMiddleware';
import roles from '../../shared/security/roles';
import { staffLogin } from '../../controllers/authController';
import {
  getAdminDashboardData,
  getTotalPendingUsers,
} from '../../controllers/adminController';
import {
  decryptRequestBody,
  validateAppID,
} from '../../middlewares/cryptoMiddleware';

const router = express.Router();
const { admin } = roles;

router.post(
  '/login',
  validateAppID,
  decryptRequestBody,
  // validateAdminLoginDetails,
  staffLogin
);
router.get(
  '/dashboard',
  authorize([admin]),
  validateAppID,
  getAdminDashboardData
);
router.get(
  '/count/pending/users',
  authorize([admin]),
  validateAppID,
  getTotalPendingUsers
);

export default router;
