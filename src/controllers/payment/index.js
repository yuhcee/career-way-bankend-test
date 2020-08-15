import { Router } from 'express';
import enrollment from '../../router/v1/enrollment-routes';
import validate  from '../../router/v1/validate-routes';

const router = Router();

router.use('/validate', validate );
router.use('/enrollment', enrollment);

export default router;