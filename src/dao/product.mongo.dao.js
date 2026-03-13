import { BaseDAO } from "./base.dao.js";
import { Product } from "../models/product.model.js";

export class ProductMongoDAO extends BaseDAO {
    constructor() { super(Product); }

    async listPaginated({ page = 1, limit = 10, category } = {}) {
        const filter = {};
        if (category) filter.category = category;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.model.countDocuments(filter)
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
}
