import { Router } from "express";
import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { requireLogin, alreadyLogin, requireJWT } from "../../middleware/auth.middleware.js";
import jwt from 'jsonwebtoken';
import passport from "passport";
import { toUserDTO } from "../../models/dto/user.dto.js";
import crypto from "crypto";
import { mailerService } from "../../services/mailer.service.js";

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

// Endpoint para obtener datos del usuario actual (seguro con DTO) - Compatible con Session y JWT
router.get('/current', async (req, res) => {
    try {
        let user = null;

        // Intenta obtener usuario de sesión
        if (req.session?.user) {
            user = await User.findById(req.session.user._id).lean();
        }
        // Si no hay sesión, intenta obtener del JWT
        else {
            const header = req.headers.authorization || "";
            const token = header.startsWith("Bearer ") ? header.slice(7) : null;
            
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave_secreta");
                    user = await User.findById(decoded.sub).lean();
                } catch (err) {
                    return res.status(401).json({ error: "Token inválido o expirado." });
                }
            }
        }

        if (!user) {
            return res.status(401).json({ error: "Usuario no autenticado." });
        }

        // Devuelvo el usuario con DTO (sin información sensible)
        res.status(200).json({ user: toUserDTO(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "El email es requerido." });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Generar token aleatorio (32 bytes = 64 caracteres hex)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Establecer token y expiración (1 hora)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await user.save();

        // Construir URL de recuperación
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;

        // Enviar email
        await mailerService.sendMail({
            to: email,
            subject: 'Recuperación de Contraseña',
            template: 'password-reset',
            contexto: { 
                name: user.first_name,
                resetUrl,
                expiresIn: '1 hora'
            }
        });

        res.status(200).json({ 
            message: "Email de recuperación enviado exitosamente.",
            info: "Revisa tu correo para el enlace de recuperación (válido por 1 hora)"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Restablecer contraseña
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "Token, nueva contraseña y confirmación son requeridos." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Las contraseñas no coinciden." });
        }

        // Hash del token para buscar en BD
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar usuario con token válido y no expirado
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: new Date() } // Verificar que no haya expirado
        });

        if (!user) {
            return res.status(400).json({ error: "Token inválido o expirado." });
        }

        // Validar que no sea la misma contraseña anterior
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior." });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña y limpiar token
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ 
            message: "Contraseña restablecida exitosamente.",
            info: "Ya puedes iniciar sesión con tu nueva contraseña"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;