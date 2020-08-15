import express from 'express';
import companyRouter from './v1/aggregatorRouter';
import merchantRouter from './v1/merchantRouter';
import paymentEnrollmentRoute from './v1/enrollmentRoutes';
import transactionRoutes from './v1/transactionRoutes';
import adminRoutes from './v1/adminRoutes';
import authRoutes from './v1/authRoutes';
import paymentTypeRoutes from './v1/paymtnentTypeRoutes';
// import generatePaymentTokenRoute from './v1/generatePaymentTokenRoutes';

const router = express.Router();

/**
 * Users (Aggregators and Merchants)
 */
router.use('/aggregators', companyRouter);
router.use('/merchants', merchantRouter);
router.use('/transactions', transactionRoutes);
router.use('/payment_types', paymentTypeRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

/**
 * Payments
 */
router.use('/payment/enrollment', paymentEnrollmentRoute);
// router.use('/generate', generatePaymentToken);

export default router;
