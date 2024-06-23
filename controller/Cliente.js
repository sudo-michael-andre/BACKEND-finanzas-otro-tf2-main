const Cliente = require('../model/Cliente');

/**
 * Clase Controladora para manejar operaciones de Cliente
 */
class ClienteController {
  static async crearCliente(req, res) {
    try {
      const nuevoCliente = new Cliente(req.body);
      const clienteGuardado = await nuevoCliente.save();
      res.status(201).json(clienteGuardado);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
    
  }

  static async obtenerClientes(req, res) {
    try {
      const clientes = await Cliente.find();
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerClientePorId(req, res) {
    try {
      const cliente = await Cliente.findById(req.params.id);
      if (!cliente) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.status(200).json(cliente);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async actualizarCliente(req, res) {
    try {
      const clienteActualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!clienteActualizado) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.status(200).json(clienteActualizado);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async eliminarCliente(req, res) {
    try {
      const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
      if (!clienteEliminado) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async getClientesPorEmpresa(req, res) {
    try {
      const empresaID = req.params.empresaID;
      const todosLosClientes = await Cliente.find({ Empresa_id: empresaID });
      res.status(200).json(todosLosClientes);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener los clientes", error });
    }
  }
}

module.exports = ClienteController;
