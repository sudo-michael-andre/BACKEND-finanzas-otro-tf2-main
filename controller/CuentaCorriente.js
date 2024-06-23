const CuentaCorriente = require('../model/CuentaCorriente');

/**
 * Clase Controladora para manejar operaciones de CuentaCorriente
 */
class CuentaCorrienteController {
  static async crearCuentaCorriente(req, res) {
    try {
      const nuevaCuentaCorriente = new CuentaCorriente(req.body);
      const cuentaCorrienteGuardada = await nuevaCuentaCorriente.save();
      res.status(201).json(cuentaCorrienteGuardada);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async obtenerCuentasCorrientes(req, res) {
    try {
      const cuentasCorrientes = await CuentaCorriente.find();
      res.status(200).json(cuentasCorrientes);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerCuentaCorrientePorId(req, res) {
    try {
      const cuentaCorriente = await CuentaCorriente.findById(req.params.id);
      if (!cuentaCorriente) {
        return res.status(404).json({ mensaje: 'Cuenta corriente no encontrada' });
      }
      res.status(200).json(cuentaCorriente);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async actualizarCuentaCorriente(req, res) {
    try {
      const cuentaCorrienteActualizada = await CuentaCorriente.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!cuentaCorrienteActualizada) {
        return res.status(404).json({ mensaje: 'Cuenta corriente no encontrada' });
      }
      res.status(200).json(cuentaCorrienteActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async eliminarCuentaCorriente(req, res) {
    try {
      const cuentaCorrienteEliminada = await CuentaCorriente.findByIdAndDelete(req.params.id);
      if (!cuentaCorrienteEliminada) {
        return res.status(404).json({ mensaje: 'Cuenta corriente no encontrada' });
      }
      res.status(200).json({ mensaje: 'Cuenta corriente eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerCuentaCorrientePorEmpresaId(req, res) {
    try {
      const { empresaId } = req.params;
      const cuentaCorriente = await CuentaCorriente.findOne({ empresa_id: empresaId })
        .populate({
          path: 'transacciones',
          populate: {
            path: 'Cliente_id',
            model: 'Cliente'
          }
        })
        .exec();

      if (!cuentaCorriente) {
        return res.status(404).json({ mensaje: 'Cuenta corriente no encontrada para este empresa ID' });
      }

      let saldo = 0;
      cuentaCorriente.transacciones.forEach(transaccion => {
        if (transaccion.tipo === 'ingreso') saldo += transaccion.monto;
        if (transaccion.tipo === 'egreso') saldo -= transaccion.monto;
      });
      cuentaCorriente.saldo = saldo;

      await cuentaCorriente.save();
      res.status(200).json(cuentaCorriente);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener la cuenta corriente', error: error.message });
    }
  }
}

module.exports = CuentaCorrienteController;
