//Este archivo proporciona métodos genéricos para interactuar con una base de datos utilizando un modelo de Mongoose.
//La clase incluye métodos para crear, leer, actualizar y eliminar documentos, así como para contar documentos en la colección.

export class BaseDAO {
    constructor(model) { this.model = model }

    async create(data) { return await this.model.create(data) }
    async getById(id) { return await this.model.findById(id).lean() }
    async getOne(filter = {}) { return await this.model.findOne(filter).lean() }
    async getAll(filter = {}, options = {}) {
        const query = this.model.find(filter);
        if (options.sort) query.sort(options.sort);
        if (options.limit) query.limit(options.limit);
        if (options.skip) query.skip(options.skip);
        if (options.select) query.select(options.select);
        return await query.lean();
    }
    async updateById(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true, runValidator: true }).lean();
    }
    async deleteById(id) { return await this.model.findByIdAndDelete(id).lean() }
    async count(filter = {}) { return await this.model.countDocuments(filter) }
}