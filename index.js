const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const VentaRoutes = require('./Routes/Venta');
const ClienteRoutes = require('./Routes/Cliente');
const UsuarioRoutes = require('./Routes/Usuario');
const TipoCreditoRoutes = require('./Routes/TipoCredito');
const TipoInteresRoutes = require('./Routes/TipoInteres');
const EmpresaRoutes = require('./Routes/Empresa');
const CuotaRoutes = require('./Routes/Cuota');
const CuentaCorrienteRoutes = require('./Routes/CuentaCorriente');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  connectToDatabase() {
    mongoose.connect('mongodb://127.0.0.1:27017/finanzas-tf2')
      .then(() => console.log('Conexión a MongoDB exitosa'))
      .catch((error) => console.error('Error al conectar a MongoDB:', error));

    mongoose.connection.on('connected', () => {
      console.log('Mongoose está conectado');
    });

    mongoose.connection.on('error', (err) => {
      console.log('Mongoose tuvo un error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose está desconectado');
    });
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(morgan('dev'));
  }

  initializeRoutes() {
    this.app.use('/ventas', VentaRoutes);
    this.app.use('/clientes', ClienteRoutes);
    this.app.use('/usuarios', UsuarioRoutes);
    this.app.use('/tipocreditos', TipoCreditoRoutes);
    this.app.use('/tipointereses', TipoInteresRoutes);
    this.app.use('/empresas', EmpresaRoutes);
    this.app.use('/cuotas', CuotaRoutes);
    this.app.use('/cuentacorriente', CuentaCorrienteRoutes);

    // Manejo de rutas no encontradas
    this.app.use((req, res, next) => {
      res.status(404).json({ message: 'Recurso no encontrado' });
    });
  }

  initializeErrorHandling() {
    // Manejo de errores
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Error interno del servidor' });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }
}

const server = new Server();
server.start();
