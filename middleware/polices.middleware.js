export const polices = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authorized." });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbiden" }); // Si el rol no está en la lista de roles permitidos, no está autorizado
    next();
}