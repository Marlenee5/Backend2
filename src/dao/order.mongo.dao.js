import { BaseDAO } from "./base.dao.js";
import { Order } from "../models/order.model.js";

export class OrderMongoDAO extends BaseDAO {
    constructor() { super(Order) } // Esto me trae los metodos de BaseDAO y los aplica al modelo Order, lo que me permite usar esos metodos para interactuar con la colección de orders en MongoDB.

    async getByCode(code) {
        return await this.model.findOne({ code }).lean()
    }

    async listPaginated({ page = 1, limit = 10, status } = {}) {
        const filter = {};
        if (status) filter.status = status;
        const skip = (page - 1) * limit; // Calcula cuántos documentos se deben saltar para llegar a la página deseada. Por ejemplo, si page es 2 y limit es 10, skip será 10, lo que significa que se saltarán los primeros 10 documentos (página 1) y se comenzará a mostrar desde el documento 11 (página 2).
        const [items, total] = await Promise.all([
            this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.model.countDocuments(filter)
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) }; // Retorna un objeto con los items encontrados, el total de items, la página actual, el límite por página y el total de páginas calculado a partir del total de items y el límite.
    }
}