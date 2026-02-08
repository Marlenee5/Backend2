import CustomRouter from './custom/CustomRouter.js';
import { requireJwtCookie } from '../middleware/auth.middleware.js';
import { polices } from '../middleware/polices.middleware.js';
import { Student } from '../config/models/student.model.js';


const router = new CustomRouter({ mergeParams: true });

// Params loader (carga previa de :id)
router.params('id', async (req, res, next, id) => {
    try {
        const s = await Student.findById(id).lean();
        req.studentLoader = s || null; // Si no se encuentra el estudiante, se asigna null
    } catch (_) {
        req.studentLoader = null; // Si hay un error, se asigna null para indicar que no se pudo cargar el estudiante
    }
    next();
})

// Ruta con middleware en cadena (orden claro) : auth -> politica de roles -> handler
// Esta ruta utiliza el middleware de autenticación para verificar el JWT en la cookie, luego verifica las políticas de roles (admin o user) y finalmente maneja la solicitud
router.get('/students/:id', requireJwtCookie, polices('admin', 'user'), (req, res) => {
    if (!req.studentLoader) return res.status(404).json({ error: "Student Not found.! (pre-cargado)" });
    res.status(200).json({loadedByParams: true, student: req.studentLoader});
})


//  Enrutador Ping
// Este grupo de rutas se encuentra bajo el prefijo '/v1', lo que significa que todas las rutas definidas dentro de este grupo estarán disponibles bajo la ruta '/v1/*'.
// En este caso, se define una ruta GET para '/ping' que responde con un objeto JSON indicando que la conexión es exitosa y especificando la versión de la API.
router.group('/v1', (v1) => {
    v1.get('/ping', (req, res) => res.json({ok: true, version: 'v1'}))
});

// Subrouter anidado con MergeParams: /students/:id/courses/*
router.group('/students/:id', (sub) => {
    sub.get('/courses', requireJwtCookie, (req, res) => {
        res.json({
            studentId: req.params.id,
            student: req.studentLoader, // Acceso al estudiante cargado previamente por el params loader
            note: "Ejemplo para Subrouter con MergeParams",
            courses: ['JS Avanzado', 'Backend', 'SQL Avanzado', 'MongoDB']
        })
    })
})

// Router async con error capturado automáticamente por custom router (no es necesario el try/catch)
router.get('/async-error', async (req, res) => {
    throw new Error('Error simulado en ruta asíncrona');
});

export default router.router;