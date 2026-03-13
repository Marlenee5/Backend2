import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Bienvenido al backend de Coder House' });
});

export default router;