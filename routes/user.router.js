import { Router } from "express";
import { User } from "../config/models/user.model.js";
import bcrypt from "bcrypt";
import { requireLogin, alreadyLogin } from "../middleware/auth.middleware.js";

const router = new Router();

// Endpoint para registrar un nuevo usuario
router.post("/register", requireLogin, async (req, res) => {
    try {
        const { first_name, last_name, email, password, age} = req.body;

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

// Endpoint para login de usuario
router.post("/login", alreadyLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        };

        const user = await User.findOne({ email });
        if (!user) { return res.status(400).json({ error: `El email ${email} no está registrado.` }); }

        const valid = await bcrypt.compare(password, user.password); // compara la contraseña ingresada con el hash guardado
        if (!valid) { return res.status(400).json({ error: "Credenciales inválidas." }); }

        // Lo que guardamos en la sesión
        req.session.user = { id: user._id, email: user.email, name: user.name };

        res.status(200).json({ message: "Login exitoso.", user: req.session.user }); // Después que hace login exitoso le pido que solo me muestre los datos de la sesión, esto no incluye el password

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para logout de usuario
router.post("/logout", requireLogin, async (req, res) => {
    try {
        const { name } = req.session.user;
        const full_name = name + " ";
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: "Error al cerrar la sesión.", error: err });
            res.clearCookie('connect.sid', { path: '/' }); // Limpiamos la cookie del navegador
            res.status(200).json({ message: "Logout exitoso.", byebye: full_name });
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// Endpoint para traer todos los usuarios
router.get('/', requireLogin, async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json({ "users": user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

export default router;

// // Verifica que la respuesta sea exitosa
// if (pm.response.code === 200) {
//     // Obtiene el token de la respuesta JSON
//     var jsonResponse = pm.response.json();
//     var token = jsonResponse.token; // Asegúrate de que 'token' sea el nombre de la propiedad en la respuesta

//     // Guarda el token en una variable de entorno llamada 'authToken'
//     pm.environment.set("authToken", token);
    
//     // Muestra un mensaje en los logs de Postman
//     console.log("Token guardado en la variable de entorno: " + token);
// } else {
//     console.log("Error en la autenticación. Código de respuesta: " + pm.response.code);
// }