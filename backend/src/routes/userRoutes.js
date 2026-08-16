import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apenas Admin pode gerenciar usuários
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
