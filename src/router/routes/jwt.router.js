import { Router } from "express";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { requireJwtCookie, requireManyRoles } from "../../middleware/auth.middleware.js";
import jwt from 'jsonwebtoken';


const router = new Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }
        const exist = await User.findOne({ email});
        if (exist) return res.status(400).json({ error: `El email ${email} ya está registrado.` });

        const hash = await bcrypt.hash(password, 10);
        await User.create({ first_name, last_name, email, age, password: hash });
        res.status(201).json({ message: "Usuario registrado exitosamente.", user: { first_name, last_name, email, age } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// JWT Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Credenciales inválidas. - Email no proporcionado." })
        }
        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return res.status(400).json({ error: "Credenciales inválidas." })
        }
        const isValid = await bcrypt.compare(password, user.password); // Comparamos el password con el hash guardado
        if (!isValid) return res.status(400).json({ error: "Credenciales inválidas." });

        const payload = { // Datos que quiero guardar en el token
            sub: String(user._id),
            email: user.email,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "clave_Secreta_JWT", { expiresIn: '1h' }); // firmo el token con la clave secreta

        // Cookie HttpOnly
        res.cookie('access_token', token, {
            httpOnly: true,
            sameSite: 'lax', // Aseguramos que la cookie se envíe solo en el mismo sitio
            secure: false, // Cambiar a true si se usa HTTPS
            maxAge: 3600000, // 1 hora
            path: '/', // La cookie estará disponible en todo el sitio
        });

        res.status(200).json({ message: "Login exitoso (JWT en cookie).", user: user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta protegida que devuelve los datos del usuario logueado mediante JWT en cookie
router.get('/me', requireJwtCookie, requireManyRoles('user', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found.!" });
        const { first_name, last_name, email, age, role } = user;

        res.status(200).json(
            {
                message: "Usuario encontrado",
                user: { first_name, last_name, email, age, role }
            }
        )
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para logout (eliminar la cookie)
router.post('/logout', requireJwtCookie, (req, res) => {
    try {
        res.clearCookie('access_token', { path: '/' }); // Elimina la cookie del token
        res.status(200).json({ message: "Logout exitoso. - Cookie de JWT Eliminada." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;