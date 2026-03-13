import express from 'express';
import passport from 'passport';

import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';

import enviroment, { validateEnv } from '../config/env/env.config.js';

import { initRouters } from './../router/router.padre.js';
import logger from '../middleware/logger.middleware.js'

import { connectAuto } from './../config/db/connect.config.js';
import { initPassport } from './../config/auth/passport.config.js';

import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { hbsHelpers } from './hbs.helper.js';


const app = express();
const PORT = enviroment.PORT;
const SECRET_SESSION = enviroment.SECRET_SESSION; // secreto para firmar la cookie de sesión

app.use(express.json());
app.use(logger);
app.use(cookieParser(SECRET_SESSION));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = async () => {

    // Validamos las variables de entorno obligatorias antes de iniciar el servidor
    validateEnv();

    // Conectamos a la base de datos antes de iniciar el servidor
    await connectAuto();

    const store = MongoStore.create({
        client: ((await import('mongoose')).default.connection.getClient()),
        ttl: 60 * 60 // 1 hora
    });

    // Generamos la cookie de sesión
    app.use(session({
        secret: SECRET_SESSION, // Acá utilizo la variable de entorno
        resave: false,
        saveUninitialized: false,
        store,
        cookie: ({ maxAge: 60 * 60 * 1000 }), // 1 hora
        httpOnly: true,
        signed: true
    })
    );

    initPassport();
    app.use(passport.initialize());
    app.use(passport.session());

    // Rutas de Handlebars
    app.engine('handlebars', engine({
        defaultLayout: 'main',
        layoutDir: path.join(__dirname, '../views/layouts'),
        helpers: hbsHelpers,
    }))
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../views'));


    // Inicializo las rutas
    initRouters(app);
    

    // Manejo de señales y errores globales
    process.on('unhandledRejection', (reason) => {
        console.error('[process] Unhandled Rejection ', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('[process] Uncaught Exception ', err);
    });

    process.on('SIGINT', () => {
        console.log('\n[process] SIGINT recibido. Cerrando...');
        process.exit(0);
    });

    // Incializacion de el servidor (listen)
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}