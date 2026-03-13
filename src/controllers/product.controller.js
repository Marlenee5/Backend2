import { productService as svc } from '../services/product.service.js';

class ProductController {
    async list(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const category = req.query.category || null;
            const data = await svc.list({ page, limit, category });
            res.status(200).json(data);
        } catch (err) { res.status(500).json({ error: err.message }); }
    }

    async getById(req, res) {
        try {
            const product = await svc.get(req.params.id);
            if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
            res.status(200).json({ product });
        } catch (err) { res.status(500).json({ error: err.message }); }
    }

    async create(req, res) {
        try {
            const product = await svc.create(req.body);
            res.status(201).json({ product });
        } catch (err) { res.status(500).json({ error: err.message }); }
    }

    async update(req, res) {
        try {
            const product = await svc.update(req.params.id, req.body);
            if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
            res.status(200).json({ product });
        } catch (err) { res.status(500).json({ error: err.message }); }
    }

    async delete(req, res) {
        try {
            const product = await svc.delete(req.params.id);
            if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
            res.status(204).end();
        } catch (err) { res.status(500).json({ error: err.message }); }
    }
}

export const productController = new ProductController();