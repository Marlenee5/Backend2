import jwt from 'jsonwebtoken';
import passport from 'passport';

export function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not Authorized" });
    }
    next(); // Si no estas logueado, continúa al siguiente middleware o ruta
}

// Middleware para evitar que un usuario logueado acceda a ciertas rutas (ej: login, register)
export function alreadyLogin(req, res, next) {
    if (req.session.user) {
        return res.status(403).json({ error: "Ya estas logueado.!" })
    }
    next();
}


// Autorización por Role
export function requireRole(role) {
    return (req, res, next) => {
        const user = req.session?.user || req.user; // Session o Passport
        if (!user) return res.status(401).json({ error: "Not authorized." });
        if (user.role !== role) return res.status(403).json({ error: "Forbiden" }); // Si el rol es distinto al rol que paso por parámetro, no está autorizado
        next(); // Si tiene el rol adecuado, continúa al siguiente middleware o ruta
    }
}

// Autorización por Roles Múltiples
export function requireManyRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: "Not authorized." });
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbiden" }); // Si el rol no está en la lista de roles permitidos, no está autorizado
        next(); // Si tiene uno de los roles adecuados, continúa al siguiente middleware o ruta
    }
}


// Requiere Passport-jwt leyendo la cookie de acces_token
export const requireJwtCookie = passport.authenticate('jwt-cookie', {session: false});


// Autorización por JWT
export function requireJWT(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7, header.length) : null;
    if (!token) return res.status(401).json({ error: "Not authorized", token: "Not exists" });
    try {
        req.jwt = jwt.verify(token, process.env.JWT_SECRET || "clave_secreta"); // Verifico el token y lo agrego a la request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Not authorized" + error.message, token: "Invalid Token" });
    }
}