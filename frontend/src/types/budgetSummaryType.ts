export type BudgetSummary = {
  id: string;
  service: string; // Nome da família/serviço
  value: string;
  createdAt: string;
  updatedAt: string;
  citizenship: 'IT';
  status: string;
  clientName?: string;
};
