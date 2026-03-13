// DTO para exponer datos seguros del usuario sin información sensible
export function toUserDTO(user) {
    if (!user) return null;
    
    return {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
        // NO incluir: password, githubId
    }
}

// Validación para crear usuario (sin contraseña sensible en respuesta)
export function toCreateUserDTO(body) {
    const { first_name, last_name, email, age } = body ?? {};
    if (!first_name || !last_name || !email || typeof age !== 'number') {
        throw new Error('Payload inválido - Datos incompletos para crear usuario');
    }
    return { first_name, last_name, email, age };
}
