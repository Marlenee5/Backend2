// Validaciones para los datos de entrada relacionados con estudiantes.
export function toCreateStudentDto(body) {
    const { name, email, age } = body ?? {}; // Si body es null o undefined, se asigna un objeto vacío para evitar errores de desestructuración.
    if (!name || !email || typeof age !== "number") { // Verificamos que name y email sean truthy (no null, undefined, vacío, etc.) y que age sea un número.
        throw new Error('Payload inválido: se requieren name, email y age (debe ser un número).');
    };
    // email = String(email).trim().toLowerCase(); // Normalizamos el email para evitar problemas de formato. 
    return { name, email, age } // Retornamos un nuevo objeto con las propiedades necesarias para crear un estudiante.
}

// Validaciones para actualizar un estudiante.
export function toUpdateStudentDto(body) {
    const out = {}; // Creamos un nuevo objeto vacío que se llenará con las propiedades válidas.
    if (body?.name) out.name = body.name; // Si se proporciona name, lo agregamos al objeto de salida.
    if (body?.email) out.email = body.email;
    if (typeof body?.age === "number") out.age = body.age; // Solo agregamos age si es un número, para evitar problemas de tipo.
    return out;
}

