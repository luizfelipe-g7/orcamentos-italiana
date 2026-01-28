import { app } from './app';
import { env, testConnection } from './config';
import { logger } from './utils';

const PORT = env.PORT;

async function bootstrap() {
  // Testa conexão com o banco de dados
  logger.info('🔄 Verificando conexão com o banco de dados...');

  const isConnected = await testConnection();

  if (!isConnected) {
    logger.error('❌ Falha ao conectar com o banco de dados');
    process.exit(1);
  }

  logger.info('✅ Conexão com o banco de dados estabelecida');

  // Inicia o servidor
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
    logger.info(`📋 Ambiente: ${env.NODE_ENV}`);
    logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  });
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, '❌ Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, '❌ Unhandled Rejection');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

bootstrap();
