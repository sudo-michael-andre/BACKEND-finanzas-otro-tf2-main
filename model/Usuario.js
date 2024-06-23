const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Esquema para los usuarios
 */
const UsuarioSchema = new Schema({
  user: {
    type: String,
    required: true,
    unique: true,
    description: "Nombre de usuario único"
  },
  pass: {
    type: String,
    required: true,
    description: "Contraseña del usuario"
  },
  correo: {
    type: String,
    required: true,
    description: "Correo electrónico del usuario"
  },
  Empresa_id: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    description: "ID de la empresa a la que pertenece el usuario"
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Crear un índice único en el campo 'user'
UsuarioSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
