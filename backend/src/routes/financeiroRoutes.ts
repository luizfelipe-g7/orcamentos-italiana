import { Router } from 'express';
import { financeiroController } from '../controllers/financeiroController';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { honorarioSchema, paganteSchema, parcelaSchema } from '../schemas/financeiroSchema';

const router = Router();

router.use(authMiddleware);

// Honorários
router.get('/honorarios/:orcamentoId', financeiroController.listarHonorarios);
router.post('/honorarios', validate(honorarioSchema), financeiroController.criarHonorario);
router.delete('/honorarios/:id', financeiroController.excluirHonorario);

// Pagantes
router.get('/pagantes/:orcamentoId', financeiroController.listarPagantes);
router.post('/pagantes', validate(paganteSchema), financeiroController.criarPagante);
router.delete('/pagantes/:id', financeiroController.excluirPagante);

// Parcelas
router.put('/parcelas/:id', validate(parcelaSchema.partial()), financeiroController.atualizarParcela);

export default router;
