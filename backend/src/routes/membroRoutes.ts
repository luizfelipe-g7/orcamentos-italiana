import { Router } from 'express';
import { membroController } from '../controllers/membroController';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { createMembroSchema, updateMembroSchema } from '../schemas/membroSchema';

const router = Router();

router.use(authMiddleware);

// Listar membros de um orçamento específico
router.get('/orcamento/:orcamentoId', membroController.listarPorOrcamento);

// Listar todos os membros (ADM)
router.get('/', membroController.listarTodos);

// CRUD básico
router.get('/:id', membroController.buscarPorId);
router.post('/', validate(createMembroSchema), membroController.criar);
router.put('/:id', validate(updateMembroSchema), membroController.atualizar);
router.delete('/:id', membroController.excluir);

export default router;
