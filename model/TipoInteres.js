const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TipoInteresSchema = new Schema({
  nombre: {
    type: String,
    required: true
  }
});

// Crea el modelo de TipoInteres y asigna el esquema, especificando el nombre de la colección
module.exports = mongoose.model('TipoInteres', TipoInteresSchema, 'tipointereses');
