import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  uploadVerificationDoc,
  updateVerificationStatus,
  getUserRewards,
  updatePreferences,
  getNotifications,
  markNotificationRead
} from '../controllers/authController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

router.post('/verify/document', auth, uploadVerificationDoc);
router.patch('/verify/status', auth, adminOnly, updateVerificationStatus);

router.get('/rewards', auth, getUserRewards);
router.put('/preferences', auth, updatePreferences);

router.get('/notifications', auth, getNotifications);
router.patch('/notifications/:id', auth, markNotificationRead);

export default router;
