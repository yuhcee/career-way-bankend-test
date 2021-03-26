import express from 'express';
import { checkSubmission, getAllAssignments, getAssignment } from '../../controllers/assignment';

const router = express.Router();

router.post('/compare', checkSubmission);
router.get('/viewAll', getAllAssignments);
router.get('/view/:id', getAssignment);

export default router;
