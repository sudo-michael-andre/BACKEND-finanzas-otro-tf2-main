const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Esquema para las empresas
 */
const EmpresaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    description: "Nombre de la empresa"
  },
  ruc: {
    type: String,
    required: true,
    description: "Registro Único de Contribuyentes (RUC) de la empresa"
  }
}, {
  timestamps: true,
  collection: 'empresas'
});

module.exports = mongoose.model('Empresa', EmpresaSchema);
