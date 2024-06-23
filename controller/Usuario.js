const Usuario = require('../model/Usuario');

class UsuarioController {
  static async crearUsuario(req, res) {
    try {
      const nuevoUsuario = new Usuario(req.body);
      const usuarioGuardado = await nuevoUsuario.save();
      res.status(201).json(usuarioGuardado);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ mensaje: 'El nombre de usuario ya existe. Por favor elige otro.' });
      } else {
        res.status(400).json({ mensaje: error.message });
      }
    }
  }

  static async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerUsuarioPorId(req, res) {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async actualizarUsuario(req, res) {
    try {
      const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json(usuarioActualizado);
    } catch (error) {
      console.log(error)
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async eliminarUsuario(req, res) {
    try {
      const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
      if (!usuarioEliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async verificarLogin(req, res) {
    const { correo, pass } = req.body;
    try {
      const usuario = await Usuario.findOne({ correo, pass });
      if (!usuario) {
        return res.status(401).json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
      }
      res.status(200).json({ success: true, mensaje: 'Login exitoso', usuario });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerUsuariosPorEmpresa(req, res) {
    try {
      const { empresaID } = req.params;
      const usuarios = await Usuario.find({ Empresa_id: empresaID });
      if (usuarios.length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron usuarios para esta empresa' });
      }
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = UsuarioController;
