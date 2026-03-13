import mongoose from 'mongoose';

const orderItemsSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Referencia al modelo Product
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }

}, { _id: false }); // Evita que Mongoose cree un _id para cada item del array

const orderSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    items: { type: [orderItemsSchema], default: [] },
    total: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'delivered', 'cancelled'], default: 'pending', index: true }
}, { timestamps: true });

// 1- Calcular total ANTES de validar (Cubre el create)
orderSchema.pre('validate', function (next) {
    const items = Array.isArray(this.items) ? this.items : [];
    this.total = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0); // Calcula el total sumando el precio por la cantidad de cada item, asegurándose de que ambos sean números válidos.
    next();
});

// 2- Calcular total en Updates cuando cambien los items (Cubre el update)
orderSchema.pre('findByIdAndUpdate', function (next) {
    const update = this.getUpdate() || {};
    // Si vienen los items en el update, recalculamos el total
    if (update.items) {
        const items = Array.isArray(update.items) ? update.items : [];
        update.total = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
        this.setUpdate(update); // Asegura que el total calculado se incluya en el update que se va a aplicar al documento.  
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);