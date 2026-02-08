import { Router } from "express";
import { User } from "../config/models/user.model.js";
import bcrypt from "bcrypt";
import { requireLogin, alreadyLogin, requireJWT } from "../middleware/auth.middleware.js";
import jwt from 'jsonwebtoken';
import passport from "passport";

const router = new Router();

// Registro de usuario Local (hash con bcrypt)
router.post("/register", alreadyLogin, async (req, res) => {
    try {
        const { first_name, last_name, email, password, age } = req.body;

        if (!first_name || !last_name || !email || !password || !age) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        };

        const exist = await User.findOne({ email });
        if (exist) { return res.status(400).json({ error: `El email ${email} ya está registrado.` }); }

        const hash = await bcrypt.hash(password, 10); // hasheo la contraseña con un salt de 10 rondas
        const user = new User({ first_name, last_name, email, password: hash, age });
        await user.save();
        res.status(201).json({ message: "Usuario registrado exitosamente.", user: user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login de usuario con Passport
router.post("/login", alreadyLogin, async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || "Credenciales inválidas." });

        req.logIn(user, { session: true }, (err2) => {
            if (err2) return next(err2);
            req.session.user = user; // Le asigno el usuario USER a la sesión
            return res.status(200).json({ message: "Login exitoso (session).", user: user });
        })
    })(req, res, next);
});

// Logout de usuario
router.post("/logout", requireLogin, async (req, res) => { // tengo que estar logueado para hacer logout "requireLogin"
    // Evite que Passport regenere la session
    req.logout({ keepSessionInfo: true }, (err) => {
        if (err) return next(err);

        //Ahora si destruimos la session
        if (req.session) {
            req.session.destroy((err2) => {
                if (err2) return next(err2);
                // Limpia la cookie de sesión (por defecto 'connect.sid')
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: "Logout exitoso." });
            })
        }
    })
});

// Endpoint para obtener datos del perfil del usuario logueado
router.get('/me', requireLogin, (req, res) => {
    res.status(200).json({ user: req.session.user });
});

// Strategy de GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/api/github/fail' }),
    (req, res) => {
        req.session.user = req.user; // guardo el usuario en la session
        res.status(200).json({ message: "Login exitoso con GitHub (session).", user: req.user });
    }
);

router.get('/github/fail', (req, res) => {
    res.status(401).json({ error: "Error en la autenticación con GitHub." });
});

// JWT Login
router.post('/jwt/login', alreadyLogin, async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
        return res.status(400).json({ message: "Credenciales inválidas." })
    }
    const isValid = await bcrypt.compare(password, user.password); // Comparamos el password con el hash guardado
    if (!isValid) return res.status(400).json({ message: "Credenciales inválidas." });

    const payload = { // Datos que quiero guardar en el token
        sub: String(user._id),
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "clave_Secreta_JWT", { expiresIn: '1h' }); // firmo el token con la clave secreta

    res.status(200).json({ message: "Login exitoso (JWT).", user: user, token });
})

// Endpoint para obtener datos del perfil del usuario logueado con JWT
router.get('/jwt/me', requireJWT, async (req, res) => {
    const user = await User.findById(req.jwt.sub).lean(); // obtengo el usuario sin el campo password
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    const { first_name, last_name, email, age, role } = user;
    res.status(200).json({ user: { first_name, last_name, email, age, role } }); // devuelvo solo los campos necesarios
});

export default router;