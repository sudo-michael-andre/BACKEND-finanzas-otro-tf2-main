const CuentaCorriente = require("../model/CuentaCorriente");
const Cuota = require("../model/Cuota");
const Pago = require("../model/Pago");
const Transaccion = require("../model/Transaccion");
const Venta = require("../model/Venta");

class CuotaController {
  static async crearCuota(req, res) {
    try {
      const nuevaCuota = new Cuota(req.body);
      const cuotaGuardada = await nuevaCuota.save();
      res.status(201).json(cuotaGuardada);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async obtenerCuotas(req, res) {
    try {
      const cuotas = await Cuota.find();
      res.status(200).json(cuotas);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerCuotaPorId(req, res) {
    try {
      const cuota = await Cuota.findById(req.params.id);
      if (!cuota) {
        return res.status(404).json({ mensaje: "Cuota no encontrada" });
      }
      res.status(200).json(cuota);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async actualizarCuota(req, res) {
    try {
      const cuotaActualizada = await Cuota.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!cuotaActualizada) {
        return res.status(404).json({ mensaje: "Cuota no encontrada" });
      }
      res.status(200).json(cuotaActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async eliminarCuota(req, res) {
    try {
      const cuotaEliminada = await Cuota.findByIdAndDelete(req.params.id);
      if (!cuotaEliminada) {
        return res.status(404).json({ mensaje: "Cuota no encontrada" });
      }
      res.status(200).json({ mensaje: "Cuota eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async obtenerCuotasPorVentaId(req, res) {
    try {
      const cuotas = await Cuota.find({ venta_id: req.params.ventaId });
      if (!cuotas.length) {
        return res.status(404).json({ mensaje: "No se encontraron cuotas para esta venta" });
      }

      const venta = await Venta.findById(req.params.ventaId).populate('Cliente_id');
      if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
      }

      const cliente = venta.Cliente_id;
      if (!cliente) {
        return res.status(404).json({ mensaje: "Cliente no encontrado" });
      }

      const diaPagoCliente = new Date(cliente.fechaPagoMensual).getDate();
      const fechaActual = new Date();
      const meses = {
        "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3,
        "Mayo": 4, "Junio": 5, "Julio": 6, "Agosto": 7,
        "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
      };

      const cuotasConAtraso = cuotas.map(cuota => {
        const [mes, año] = cuota.mes.split(' ');
        const mesNumero = meses[mes];
        if (mesNumero === undefined) {
          return {
            ...cuota._doc,
            diasAtrasado: null,
            montoMora: null,
            mensajeError: `Mes inválido: ${mes}`
          };
        }

        const fechaLimite = new Date(año, mesNumero, diaPagoCliente);

        let diasAtraso = 0;
        let montoMora = 0;
        if (fechaActual > fechaLimite && !cuota.pagado) {
          const diferenciaTiempo = fechaActual.getTime() - fechaLimite.getTime();
          diasAtraso = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
          montoMora = diasAtraso * (cliente.tasaMoratoria / 100) * cuota.monto;
        }

        return {
          ...cuota._doc,
          diasAtrasado: diasAtraso,
          montoMora: montoMora
        };
      });

      res.status(200).json(cuotasConAtraso);
    } catch (error) {
      console.error("Error al obtener cuotas:", error);
      res.status(500).json({ mensaje: error.message });
    }
  }

  static async pagarCuota(req, res) {
    try {
      const venta = await Venta.findById(req.body.ventaId).populate('Cliente_id');
      if (!venta) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }

      const cliente = venta.Cliente_id;
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      const cuentaCorriente = await CuentaCorriente.findOne({
        empresa_id: req.body.usuarioObject.Empresa_id,
      });
      if (!cuentaCorriente) {
        return res.status(404).json({ message: "Cuenta corriente no encontrada" });
      }

      const cuota = await Cuota.findById(req.params.id);
      if (!cuota) {
        return res.status(404).json({ message: "Cuota no encontrada" });
      }

      const diaPagoCliente = new Date(cliente.fechaPagoMensual).getDate();
      const fechaActual = new Date();
      const meses = {
        "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3,
        "Mayo": 4, "Junio": 5, "Julio": 6, "Agosto": 7,
        "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
      };
      const [mes, año] = cuota.mes.split(' ');
      const mesNumero = meses[mes];
      const fechaLimite = new Date(año, mesNumero, diaPagoCliente);

      let diasAtraso = 0;
      let montoMora = 0;
      if (fechaActual > fechaLimite && !cuota.pagado) {
        const diferenciaTiempo = fechaActual.getTime() - fechaLimite.getTime();
        diasAtraso = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
        montoMora = diasAtraso * (cliente.tasaMoratoria / 100) * cuota.monto;
      }

      const montoTotal = cuota.monto + montoMora;

      const nuevaTransaccion = new Transaccion({
        cuentaCorriente: cuentaCorriente._id,
        tipo: "ingreso",
        monto: montoTotal,
        fecha: new Date(),
        Cliente_id: venta.Cliente_id,
      });

      const transaccionGuardada = await nuevaTransaccion.save();
      cuentaCorriente.transacciones.push(transaccionGuardada._id);
      await cuentaCorriente.save();

      cuota.pagado = true;
      await cuota.save();

      const pago = new Pago({
        cuota_id: cuota._id,
        monto: montoTotal,
        Cliente_id: venta.Cliente_id,
      });

      await pago.save();

      const cuotasVenta = await Cuota.find({ venta_id: venta._id });
      const todasCuotasPagadas = cuotasVenta.every(cuota => cuota.pagado);

      if (todasCuotasPagadas) {
        venta.estado = false;
        await venta.save();
      }

      res.json({ message: "Cuota pagada con éxito", cuota, pago, nuevaTransaccion });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al pagar la cuota", error });
    }
  }

  static async obtenerPagosConDetallesPorVentaId(req, res) {
    try {
      const { ventaId } = req.params;
      const cuotas = await Cuota.find({ venta_id: ventaId });

      if (!cuotas.length) {
        return res.status(404).json({ message: "No se encontraron cuotas para esta venta" });
      }

      let pagosConDetalles = [];

      for (const cuota of cuotas) {
        const pagos = await Pago.find({ cuota_id: cuota._id }).populate('Cliente_id');
        if (!pagos.length) {
          continue;
        }

        pagos.forEach(pago => {
          pagosConDetalles.push({
            cuota_id: pago.cuota_id,
            numeroCuota: cuota.numeroCuota,
            monto: pago.monto,
            fecha: pago.fecha,
            cliente: pago.Cliente_id
          });
        });
      }

      res.status(200).json(pagosConDetalles);
    } catch (error) {
      console.error('Error al obtener los pagos con detalles:', error);
      res.status(500).json({ message: "Error al obtener los pagos con detalles", error });
    }
  }
}

module.exports = CuotaController;
