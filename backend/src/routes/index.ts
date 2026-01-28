import { Router } from 'express';
import authRoutes from './authRoutes';
import orcamentoRoutes from './orcamentoRoutes';
import membroRoutes from './membroRoutes';
import documentoRoutes from './documentoRoutes';
import financeiroRoutes from './financeiroRoutes';

const router = Router();

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/orcamentos', orcamentoRoutes);
router.use('/membros', membroRoutes);
router.use('/documentos', documentoRoutes);
router.use('/financeiro', financeiroRoutes);

// Rota de teste
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API Dashboard Orçamento v2.0',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      orcamentos: '/api/orcamentos',
      membros: '/api/membros',
      documentos: '/api/documentos',
      financeiro: '/api/financeiro',
    },
  });
});

export default router;
