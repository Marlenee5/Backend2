// El servicio es el que se encarga de la lógica de negocio, y el DTO se encarga de validar y transformar los datos de entrada para que el servicio pueda trabajar con ellos de manera segura y consistente.
// Los servicios también se ecangaran de interactuar con la base de datos.

//  EL servicio se ecargaría de comunicarse de una capa extra que se llamaría "repository" que es la encargada de interactuar directamente con la base de datos, y el servicio se encargaría de llamar a esa capa para realizar las operaciones necesarias. Esto ayuda a mantener una separación clara entre la lógica de negocio y la lógica de acceso a datos, lo que facilita el mantenimiento y la escalabilidad del código.


// Esto debería ser el repositorio y el servicio debería encargarse de la lógica de negocio, pero para simplificar el ejemplo, el servicio se encarga de interactuar directamente con la base de datos a través del modelo de Mongoose. En un proyecto más grande, sería recomendable separar estas responsabilidades en capas distintas para mejorar la mantenibilidad y escalabilidad del código.
import { Student } from "../models/student.model.js";
import { StudentMongoDAO } from '../dao/student.mongo.dao.js';

export class StudentService {
    constructor(dao = new StudentMongoDAO()) { this.dao = dao; }

    async listStudents() { return this.dao.getAll(); }
    async getById(id) { return this.dao.getById(id); }
    async create(dto) { return this.dao.create(dto); }
    async update(id, dto) { return this.dao.updateById(id, dto); }
    async delete(id) { return !!(await this.dao.deleteById(id)); }
    // async exists(email) { return !! ( await this.dao.exists( email )) }
}
