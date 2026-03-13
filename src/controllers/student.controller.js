import mongoose, { get } from "mongoose";
import { StudentService } from "../services/student.service.js";
import { toCreateStudentDto, toUpdateStudentDto } from "../models/dto/student.dto.js";

const service = new StudentService(); // Inyecta todos los metodos del servicios en el Controlador, dandole acceso a todos ellos.

// El controlador es el que se encarga de manejar las solicitudes HTTP, y el servicio se encarga de la lógica de negocio. El controlador recibe las solicitudes, valida los datos de entrada (usando el DTO), llama al servicio para realizar las operaciones necesarias y luego retorna una respuesta HTTP adecuada al cliente.
export const StudentController = {
    list: async (_req, res, next) => {
        try { res.status(200).json(await service.listStudents()); } catch (e) { next(e); }
    },
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
            const doc = await service.getById(id);
            return doc ? res.status(200).json(doc) : res.status(404).json({ error: 'Estudiante no encontrado' });
        } catch (e) { next(e); }
    },
    create: async (req, res, next) => {
        try {
            const dto = toCreateStudentDto(req.body); // Validamos y transformamos el cuerpo de la solicitud usando el DTO.
            // if (await service.exists(dto.email)) return res.status(400).json({ error: `El email ${dto.email} ya está en uso`});
            const newStudent = await service.create(dto);
            res.status(201).json({ newStudent }); // Retornamos el nuevo estudiante creado.
        } catch (e) { next(e); }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });

            const dto = toUpdateStudentDto(req.body); // Validamos y transformamos el cuerpo de la solicitud usando el DTO.
            const updatedStudent = await service.update(id, dto);
            return updatedStudent ? res.status(200).json(updatedStudent) : res.status(404).json({ error: 'Estudiante no encontrado' });
        } catch (e) { next(e); }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
            const deleted = await service.delete(id);
            return deleted ? res.status(204).end() : res.status(404).json({ error: 'Estudiante no encontrado' });
        } catch (e) { next(e); }
    }
}