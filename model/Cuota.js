const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Esquema para las cuotas
 */
const CuotaSchema = new Schema({
  numeroCuota: {
    type: Number,
    required: true,
    description: "Número de la cuota"
  },
  monto: {
    type: Number,
    required: true,
    description: "Monto de la cuota"
  },
  pagado: {
    type: Boolean,
    required: true,
    description: "Estado de pago de la cuota"
  },
  venta_id: {
    type: Schema.Types.ObjectId,
    ref: 'Venta',
    required: true,
    description: "ID de la venta asociada a la cuota"
  },
  mes: {
    type: String,
    required: true,
    description: "Mes correspondiente a la cuota"
  }
}, {
  timestamps: true,
  collection: 'cuotas'
});

module.exports = mongoose.model('Cuota', CuotaSchema);
