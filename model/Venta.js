const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Esquema para las ventas
 */
const VentaSchema = new Schema({
  nroVenta: {
    type: Number,
    unique: true,
    description: "Número de la venta"
  },
  montoTotal: {
    type: Number,
    required: true,
    description: "Monto total de la venta"
  },
  plazoGracia: {
    type: Number,
    required: true,
    description: "Plazo de gracia en meses"
  },
  Usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    description: "ID del usuario que realiza la venta"
  },
  fechaVenta: {
    type: Date,
    default: Date.now,
    required: true,
    description: "Fecha en la que se realiza la venta"
  },
  Cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    description: "ID del cliente que realiza la compra"
  },
  cuotas: {
    type: Number,
    required: true,
    description: "Número de cuotas para la venta"
  },
  estado: {
    type: Boolean,
    default: true,
    required: true,
    description: "Estado de la venta (activo/inactivo)"
  },
  TipoCredito_id: {
    type: Schema.Types.ObjectId,
    ref: 'TipoCredito',
    required: true,
    description: "ID del tipo de crédito asociado a la venta"
  },
  TipoInteres_id: {
    type: Schema.Types.ObjectId,
    ref: 'TipoInteres',
    required: true,
    description: "ID del tipo de interés aplicado a la venta"
  },
  tasaInteres: {
    type: Number,
    required: true,
    description: "Tasa de interés aplicada a la venta"
  }
}, {
  timestamps: true,
  collection: 'ventas'
});

// Antes de guardar, generar automáticamente el número de venta
VentaSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const lastVenta = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
      if (lastVenta) {
        this.nroVenta = lastVenta.nroVenta + 1;
      } else {
        this.nroVenta = 1; // Si es la primera venta
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Venta', VentaSchema);
