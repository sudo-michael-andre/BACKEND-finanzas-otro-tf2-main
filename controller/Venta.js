const Usuario = require("../model/Usuario");
const Venta = require("../model/Venta");
const Cuota = require("../model/Cuota");
const CuentaCorriente = require("../model/CuentaCorriente");
const Transaccion = require("../model/Transaccion");
const Cliente = require("../model/Cliente");
const TipoInteres = require("../model/TipoInteres");

class VentaController {
  static calcularPago(tasaInteres, cuotas, montoTotal) {
    let tasaDecimal = tasaInteres;

    if (tasaDecimal === 0) {
      return montoTotal / cuotas;
    } else {
      return montoTotal * (
        (tasaDecimal * Math.pow(1 + tasaDecimal, cuotas)) / 
        (Math.pow(1 + tasaDecimal, cuotas) - 1)
      );
    }
  }

  static async createVentaConCuotas(req, res) {
    try {
      const { TipoInteres_id, Cliente_id, tasaInteres, montoTotal, cuotas, plazoGracia, fechaVenta, Usuario_id } = req.body;

      const cliente = await Cliente.findById(Cliente_id);
      if (!cliente) {
        return res.status(400).json({ message: "Cliente no encontrado" });
      }

      const ventasActivas = await Venta.find({ Cliente_id, estado: true });
      const totalDeudaActiva = ventasActivas.reduce((sum, venta) => sum + venta.montoTotal, 0);

      const montoTotalNumerico = parseFloat(montoTotal);
      const nuevaDeuda = totalDeudaActiva + montoTotalNumerico;

      if (nuevaDeuda > cliente.limiteCredito) {
        return res.status(400).json({ message: "El monto total de la nueva venta excede el límite de crédito del cliente" });
      }

      const tasa = await TipoInteres.findById(TipoInteres_id);
      let tasaInteresConvertido = tasaInteres / 100;
      if (tasa.nombre === 'TNM') {
        tasaInteresConvertido = Math.pow(1 + (tasaInteres / 100) / 30, 30) - 1;
      }

      let saldoFinanciar = montoTotal;
      if (plazoGracia !== 0) {
        saldoFinanciar = montoTotal * Math.pow(1 + (tasaInteresConvertido), plazoGracia);
      }

      let R = VentaController.calcularPago(tasaInteresConvertido, cuotas, saldoFinanciar);

      const newVenta = new Venta(req.body);
      const savedVenta = await newVenta.save();

      const cuotasArray = [];
      let numeroCuotaTemporal = 0;
      const startDate = new Date(fechaVenta);
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];

      for (let i = 1; i <= plazoGracia; i++) {
        numeroCuotaTemporal++;
        startDate.setMonth(startDate.getMonth() + 1);
        cuotasArray.push({
          numeroCuota: numeroCuotaTemporal,
          monto: 0,
          pagado: true,
          venta_id: savedVenta._id,
          mes: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
        });
      }

      for (let i = 1; i <= cuotas; i++) {
        numeroCuotaTemporal++;
        startDate.setMonth(startDate.getMonth() + 1);
        cuotasArray.push({
          numeroCuota: numeroCuotaTemporal,
          monto: R,
          pagado: false,
          venta_id: savedVenta._id,
          mes: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
        });
      }

      const usuario = await Usuario.findById(req.body.Usuario_id);
      const cuentaCorriente = await CuentaCorriente.findOne({
        empresa_id: usuario.Empresa_id,
      });

      const nuevaTransaccion = new Transaccion({
        cuentaCorriente: cuentaCorriente._id,
        tipo: "egreso",
        monto: montoTotalNumerico,
        fecha: new Date(),
        Cliente_id: req.body.Cliente_id,
      });

      const transaccionGuardada = await nuevaTransaccion.save();
      cuentaCorriente.transacciones.push(transaccionGuardada._id);
      await cuentaCorriente.save();

      const savedCuotas = await Cuota.insertMany(cuotasArray);

      res.status(201).json({
        venta: savedVenta,
        cuotas: savedCuotas,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Error al crear la venta y sus cuotas", error });
    }
  }

  static async createVenta(req, res) {
    try {
      const newVenta = new Venta(req.body);
      const savedVenta = await newVenta.save();
      res.status(201).json(savedVenta);
    } catch (error) {
      res.status(400).json({ message: "Error al crear la venta", error });
    }
  }

  static async getVentas(req, res) {
    try {
      const ventas = await Venta.find()
        .populate("Cliente_id")
        .populate("TipoCredito_id")
        .populate("TipoInteres_id");
      res.status(200).json(ventas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las ventas", error });
    }
  }

  static async getVentaById(req, res) {
    try {
      const venta = await Venta.findById(req.params.id)
        .populate("Usuario_id")
        .populate("Cliente_id")
        .populate("TipoCredito_id")
        .populate("TipoInteres_id");
      if (!venta) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
      res.status(200).json(venta);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al obtener la venta", error });
    }
  }

  static async updateVenta(req, res) {
    try {
      const updatedVenta = await Venta.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedVenta) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
      res.status(200).json(updatedVenta);
    } catch (error) {
      res.status(400).json({ message: "Error al actualizar la venta", error });
    }
  }

  static async deleteVenta(req, res) {
    try {
      const deletedVenta = await Venta.findByIdAndDelete(req.params.id);
      if (!deletedVenta) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
      res.status(200).json({ message: "Venta eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la venta", error });
    }
  }

  static async getVentasPorEmpresa(req, res) {
    try {
      const userId = req.params.userId;
      const usuario = await Usuario.findById(userId);

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const empresaId = usuario.Empresa_id;
      const todasLasVentas = await Venta.find()
        .populate("Usuario_id")
        .populate("Cliente_id")
        .populate("TipoCredito_id")
        .populate("TipoInteres_id");

      const ventasEmpresa = todasLasVentas.filter((venta) =>
        venta.Usuario_id.Empresa_id.equals(empresaId)
      );

      res.status(200).json(ventasEmpresa);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al obtener las ventas por empresa", error });
    }
  }
}

module.exports = VentaController;
