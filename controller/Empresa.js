const Empresa = require('../model/Empresa');
const CuentaCorriente = require('../model/CuentaCorriente');

class EmpresaController {
  
  static async crearEmpresa(req, res) {
    try {
      const nuevaEmpresa = new Empresa(req.body);
      const empresaGuardada = await nuevaEmpresa.save();

      const nuevaCuentaCorriente = new CuentaCorriente({ empresa_id: empresaGuardada._id });
      await nuevaCuentaCorriente.save();

      res.status(201).json(empresaGuardada);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async obtenerEmpresas(req, res) {
    try {
      const empresas = await Empresa.find();
      res.status(200).json(empresas);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerEmpresaPorId(req, res) {
    try {
      const empresa = await Empresa.findById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ mensaje: 'Empresa no encontrada' });
      }
      res.status(200).json(empresa);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async actualizarEmpresa(req, res) {
    try {
      const empresaActualizada = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!empresaActualizada) {
        return res.status(404).json({ mensaje: 'Empresa no encontrada' });
      }
      res.status(200).json(empresaActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async eliminarEmpresa(req, res) {
    try {
      const empresaEliminada = await Empresa.findByIdAndDelete(req.params.id);
      if (!empresaEliminada) {
        return res.status(404).json({ mensaje: 'Empresa no encontrada' });
      }
      res.status(200).json({ mensaje: 'Empresa eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }
}

module.exports = EmpresaController;
