import { OrderMongoDAO } from '../dao/order.mongo.dao.js';

export class OrderService {
    constructor(dao = new OrderMongoDAO()) { this.dao = dao };

    async list(params) { return await this.dao.listPaginated(params) }
    async get(id) { return await this.dao.getById(id) }
    async getByCode(code) { return await this.dao.getByCode(code) }

    async create(data) {
        // Generar un código si no viene (evita error de validación)
        if (!data.code) {
            data.code = `ORD-${Date.now()}`;
        }

        // Antes de crear la orden, verificamos stock de cada producto
        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new Error('La orden debe contener al menos un item');
        }
        // Cargamos el servicio de productos para chequear stock
        const { productService } = await import('./product.service.js');
        for (const item of data.items) {
            const prod = await productService.get(item.productId);
            if (!prod) throw new Error(`Producto no encontrado: ${item.productId}`);
            if (prod.stock < item.quantity) {
                throw new Error(`Stock insuficiente para producto ${prod.title}`);
            }
        }
        // Reducimos el stock en cada producto
        for (const item of data.items) {
            const prod = await productService.get(item.productId);
            await productService.update(prod._id, { stock: prod.stock - item.quantity });
        }
        // Finalmente creamos la orden
        return await this.dao.create(data);
    }

    async update(id, data) { return await this.dao.updateById(id, data) }
    async delete(id) { return await this.dao.deleteById(id) }
}

export const orderService = new OrderService();