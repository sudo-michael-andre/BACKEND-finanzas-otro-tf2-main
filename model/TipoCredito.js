const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TipoCreditoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  }
});

// Crea el modelo de TipoCredito y asigna el esquema, especificando el nombre de la colección
module.exports = mongoose.model('TipoCredito', TipoCreditoSchema, 'tipocreditos');
