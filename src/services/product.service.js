import { ProductMongoDAO } from '../dao/product.mongo.dao.js';

export class ProductService {
    constructor(dao = new ProductMongoDAO()) { this.dao = dao; }

    async list(params) { return await this.dao.listPaginated(params); }
    async get(id) { return await this.dao.getById(id); }
    async create(data) { return await this.dao.create(data); }
    async update(id, data) { return await this.dao.updateById(id, data); }
    async delete(id) { return await this.dao.deleteById(id); }
}

export const productService = new ProductService();