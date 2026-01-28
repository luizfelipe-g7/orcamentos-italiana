import { Router } from 'express';
import { orcamentoController } from '../controllers/orcamentoController';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { createOrcamentoSchema, updateOrcamentoSchema } from '../schemas/orcamentoSchema';

const router = Router();

router.use(authMiddleware);

router.get('/', orcamentoController.listar);
router.get('/:id', orcamentoController.buscarPorId);
router.post('/', validate(createOrcamentoSchema), orcamentoController.criar);
router.put('/:id', validate(updateOrcamentoSchema), orcamentoController.atualizar);
router.delete('/:id', orcamentoController.excluir);

export default router;
