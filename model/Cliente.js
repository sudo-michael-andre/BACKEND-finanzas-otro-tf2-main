const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClienteSchema = new Schema({
  nombres: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true
  },
  tasaMoratoria: {
    type: Number,
    required: true
  },
  limiteCredito: {
    type: Number,
    required: true
  },
  fechaPagoMensual: {
    type: Date,
    required: true
  },
  Empresa_id: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  }
});

// Crea el modelo de Cliente y asigna el esquema, especificando el nombre de la colección
module.exports = mongoose.model('Cliente', ClienteSchema, 'clientes');
