import { orderService as svc } from '../services/order.service.js';
import mongoose from 'mongoose';

// Controlador de ordenes que maneja tanto vistas con Handlebars como respuestas JSON para una API RESTful.
// Incluye métodos para listar, obtener por ID o código, crear, actualizar, eliminar y sembrar datos de prueba en la colección de órdenes.
// Cada método maneja errores y responde con el código de estado HTTP adecuado y un mensaje JSON en caso de error.

class OrderController {
    // Vistas con Handlebars
    async listView(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query.status || null;
            const data = await svc.list({ page, limit, status });
            res.status(200).render('orders/index', {
                title: "Ordenes",
                orders: data.items,
                pagination: { page: data.page, limit: data.limit, total: data.total, pages: data.pages },
                currentStatus: status || "all",
            });
        } catch (err) {
            console.error(' [OrderController.listView]', err);
            res.status(500).json({ message: 'Error al obtener las órdenes', error: err });
        }
    }

    // APIJSON
    async listJSON(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query.status || null;
            const data = await svc.list({ page, limit, status });
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const order = await svc.get(req.params.id);
            if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
            res.status(200).json({ order: order });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getByCode(req, res) {
        try {
            const order = await svc.getByCode(req.params.code);
            if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
            res.status(200).json({ order: order });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const order = await svc.create(req.body);
            res.status(201).json({ order: order });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const order = await svc.update(req.params.id, req.body);
            if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
            res.status(200).json({ order: order });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const order = await svc.delete(req.params.id);
            if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
            res.status(204).end()
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Semilla rápida
    async seed(req, res) {
        try {
            const count = await svc.dao.count();
            if (count > 0) return res.status(200).json({ message: 'La colección ya tiene datos, no se pueden insertar semillas.' });
            const sample = [
                {
                    code: "A-1001", buyerName: "Juan Pérez", buyerEmail: "juan.perez@example.com",
                    items: [
                        { productId: new mongoose.Types.ObjectId(), title: "Monitor 24", quantity: 1, price: 75000 },
                        { productId: new mongoose.Types.ObjectId(), title: "Teclado", quantity: 2, price: 20000 },
                    ], status: "pending"
                },
                {
                    code: "A-1002", buyerName: "María López", buyerEmail: "maria.lopez@example.com",
                    items: [
                        { productId: new mongoose.Types.ObjectId(), title: "Mouse", quantity: 1, price: 15600 },
                        { productId: new mongoose.Types.ObjectId(), title: "Parlantes", quantity: 2, price: 18000 },
                    ], status: "pending"
                },
            ]
            const created = await Promise.all(sample.map( s => svc.create(s) ));
            res.status(201).json({ orders: created, inserted: created.length });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export const orderController = new OrderController();