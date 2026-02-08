import express from 'express';

import passport from 'passport';

import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';

import enviroment, { validateEnv } from '../config/env.config.js';


import { initRouters } from './../routes/router.padre.js';
import logger from '../middleware/logger.middleware.js'

import { connectAuto } from './../config/db/connect.config.js';
import { initPassport } from './../config/auth/passport.config.js';


const app = express();
const PORT = enviroment.PORT;
const SECRET_SESSION = enviroment.SECRET_SESSION; // secreto para firmar la cookie de sesión

app.use(express.json());
app.use(logger);
app.use(cookieParser(SECRET_SESSION));

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

    // Inicializo las rutas
    initRouters(app);

    // Incializacion de el servidor (listen)
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}