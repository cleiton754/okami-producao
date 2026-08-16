import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getOrders);
router.get('/:id', getOrderById);

// Produção e Admin podem criar e atualizar pedidos e status
router.post(
  '/',
  requireRole('admin'),
  upload.fields([
    { name: 'arte_frente', maxCount: 1 },
    { name: 'arte_verso', maxCount: 1 },
    { name: 'arquivos_extras', maxCount: 5 }
  ]),
  createOrder
);

router.put(
  '/:id',
  requireRole('admin'),
  upload.fields([
    { name: 'arte_frente', maxCount: 1 },
    { name: 'arte_verso', maxCount: 1 }
  ]),
  updateOrder
);

router.patch('/:id/status', requireRole('admin', 'producao'), updateStatus);

// Apenas Admin pode excluir pedidos
router.delete('/:id', requireRole('admin'), deleteOrder);

export default router;
