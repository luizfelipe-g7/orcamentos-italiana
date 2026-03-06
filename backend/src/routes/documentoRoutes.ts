import { Router } from 'express';
import multer from 'multer';
import { documentoController } from '../controllers/documentoController';
import { authMiddleware } from '../middlewares/auth';
// import { validate } from '../middlewares/validate';
// import { createDocumentoSchema } from '../schemas/documentoSchema';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), // Salva na memória para enviar ao S3/Local service
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(authMiddleware);

// Upload de documento (multipart/form-data)
// Nota: 'validate' middleware pode ter problemas com multipart antes do multer processar
// Por isso validamos dentro do controller ou usamos uma estratégia diferente se necessário
router.post('/upload', upload.single('arquivo'), documentoController.upload);

router.get('/membro/:membroId', documentoController.listarPorMembro);
router.put('/:id/status', documentoController.atualizarStatus);
router.delete('/:id', documentoController.excluir);

export default router;
