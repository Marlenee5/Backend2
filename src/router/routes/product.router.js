import { Router } from 'express';
import { requireJwtCookie } from '../../middleware/auth.middleware.js';
import { polices } from '../../middleware/polices.middleware.js';
import { productController as ctrl } from '../../controllers/product.controller.js';

const router = Router();

// Productos (API)
router.get('/api/products', requireJwtCookie, (req, res) => ctrl.list(req, res));
router.get('/api/products/:id', requireJwtCookie, (req, res) => ctrl.getById(req, res));
router.post('/api/products', requireJwtCookie, polices('admin'), (req, res) => ctrl.create(req, res));
router.put('/api/products/:id', requireJwtCookie, polices('admin'), (req, res) => ctrl.update(req, res));
router.delete('/api/products/:id', requireJwtCookie, polices('admin'), (req, res) => ctrl.delete(req, res));

export default router;