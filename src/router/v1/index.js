import express from 'express';

import assignmentRoutes from './assignmentRoutes';
import usersRoutes from './userRoutes';

const router = express.Router();

router.use('/assignment', assignmentRoutes);
router.use('/user', usersRoutes);

export default router;
