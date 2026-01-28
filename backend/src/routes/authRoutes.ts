import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

// Rota pública: Login
router.post('/login', validate(loginSchema), authController.login);

// Rota protegida: Dados do usuário logado
router.get('/me', authMiddleware, authController.me);

export default router;
