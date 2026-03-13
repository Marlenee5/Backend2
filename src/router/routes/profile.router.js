import { Router } from 'express';
import { requireLogin } from "../../middleware/auth.middleware.js";

const router = Router();

router.get('/', requireLogin, (req, res) => {
    try {
        const { name, email } = req.session.user;
        const full_name = name + " ";
        const welcome = `Bienvenido al perfil de ${full_name}`;
        res.status(200).json({ message: welcome, user: { name, email } }); // Acá me aseguro que la info venga de la session.user y no de otro lado
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;