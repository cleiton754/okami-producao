import express from 'express';
import { getHistory } from '../controllers/historyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getHistory);

export default router;
