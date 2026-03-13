import { Router } from "express";
import { requireJwtCookie } from "../../middleware/auth.middleware.js";
import { polices } from "../../middleware/polices.middleware.js";
import { StudentController as ctrl } from "../../controllers/student.controller.js";

// Aquí se definen las rutas para el recurso "students". Cada ruta está protegida por el middleware de autenticación (requireJwtCookie) y el middleware de autorización (policies) que verifica si el usuario tiene los permisos necesarios para realizar la acción correspondiente. Luego, cada ruta llama al método correspondiente del StudentController para manejar la solicitud y generar la respuesta adecuada.

const router = Router();
router.use(requireJwtCookie); // Aplica el middleware de autenticación a todas las rutas definidas a continuación.

router.get('/', ctrl.list); // Ruta para listar todos los estudiantes, accesible para usuarios autenticados.
router.get('/:id', polices('admin', 'user'), ctrl.getById);
router.post('/', polices('admin'), ctrl.create); // Ruta para crear un nuevo estudiante, accesible solo para usuarios con rol 'admin'.
router.put('/:id', polices('admin'), ctrl.update); // Ruta para actualizar un estudiante existente.
router.delete('/:id', polices('admin'), ctrl.delete); // Ruta para eliminar un estudiante.


export default router;