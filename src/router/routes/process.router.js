import { Router } from "express";
import { getPublicEnv } from "../../config/env/env.config.js";

const router = Router();

// Devuelve información del proceso actual, incluyendo PID, versión de Node.js, plataforma, directorio de trabajo, tiempo de actividad, uso de memoria, argumentos de línea de comandos y variables de entorno públicas.
router.get('/info', (req, res) => {
    res.status(200).json({
        pid: process.pid,
        node: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        argv: process.argv,
        public_envs: getPublicEnv() 
    })
})

router.get('/', (req, res) => {
    res.status(200).json({environments: getPublicEnv()})
})

export default router;