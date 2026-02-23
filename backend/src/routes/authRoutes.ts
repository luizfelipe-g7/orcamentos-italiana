import { Router } from 'express';
import multer from 'multer';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { authMiddleware, requireRole } from '../middlewares/auth';
import { createVendedorSchema, loginSchema, updatePhotoSchema, updateProfileSchema, updateVendedorSchema } from '../schemas/authSchema';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Rota pública: Login
router.post('/login', validate(loginSchema), authController.login);

// Rota protegida: Dados do usuário logado
router.get('/me', authMiddleware, authController.me);
router.put('/me/photo', authMiddleware, validate(updatePhotoSchema), authController.updateMyPhoto);
router.post('/me/photo/upload', authMiddleware, upload.single('foto'), authController.uploadMyPhotoFile);
router.put('/me', authMiddleware, validate(updateProfileSchema), authController.updateMyProfile);

// Gestão de vendedores (somente ADM)
router.get('/vendedores', authMiddleware, requireRole('ADM'), authController.listarVendedores);
router.post('/vendedores', authMiddleware, requireRole('ADM'), validate(createVendedorSchema), authController.criarVendedor);
router.put('/vendedores/:id', authMiddleware, requireRole('ADM'), validate(updateVendedorSchema), authController.atualizarVendedor);

export default router;
