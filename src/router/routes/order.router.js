import { Router } from 'express';
import { requireJwtCookie } from '../../middleware/auth.middleware.js';
import { polices } from '../../middleware/polices.middleware.js';
import { orderController as ctrl } from '../../controllers/order.controller.js';

const router = Router();

// Vistas con Handlebars (sin autenticación)
router.get('/orders', (req, res) => ctrl.listView(req, res));

// API REST (con autenticación JWT)
router.get('/api/orders', requireJwtCookie, (req, res) => ctrl.listJSON(req, res));
router.get('/api/orders/:id', requireJwtCookie, polices('admin', 'user'), (req, res) => ctrl.getById(req, res));
router.get('/api/orders/:code', requireJwtCookie, polices('admin', 'user'), (req, res) => ctrl.getByCode(req, res));
router.post('/api/orders', requireJwtCookie, polices('admin','user'), (req, res) => ctrl.create(req, res));
router.put('/api/orders/:id', requireJwtCookie, polices('admin'), (req, res) => ctrl.update(req, res));
router.delete('/api/orders/:id', requireJwtCookie, polices('admin'), (req, res) => ctrl.delete(req, res));

// Semilla de datos de prueba
router.post('/api/orders/seed', requireJwtCookie, polices('admin'), (req, res) => ctrl.seed(req, res) );

export default router;