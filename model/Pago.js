const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PagoSchema = new Schema({
  cuota_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cuota',
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  Cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  }
});

// Crea el modelo de Pago y asigna el esquema, especificando el nombre de la colección
module.exports = mongoose.model('Pago', PagoSchema, 'pagos');
