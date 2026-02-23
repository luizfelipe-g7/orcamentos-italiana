export const grausParentesco = [
  'Pai/Mãe',
  'Avô/Avó',
  'Bisavô/Bisavó',
  'Trisavô/Trisavó',
  'Tetraavô/Tetraavó',
  'Pentaavô/Tetraavó'
];

export const hierarchyMap: Record<string, string[]> = {
  'Pai/Mãe': ['Pai/Mãe'],
  'Avô/Avó': ['Avô/Avó', 'Pai/Mãe'],
  'Bisavô/Bisavó': ['Bisavô/Bisavó', 'Avô/Avó', 'Pai/Mãe'],
  'Trisavô/Trisavó': ['Trisavô/Trisavó', 'Bisavô/Bisavó', 'Avô/Avó', 'Pai/Mãe'],
  'Tetraavô/Tetraavó': ['Tetraavô/Tetraavó', 'Trisavô/Trisavó', 'Bisavô/Bisavó', 'Avô/Avó', 'Pai/Mãe'],
  'Pentaavô/Tetraavó': ['Pentaavô/Tetraavó', 'Tetraavô/Tetraavó', 'Trisavô/Trisavó', 'Bisavô/Bisavó', 'Avô/Avó', 'Pai/Mãe']
};

export const custosBase = {
  certidaoInteiroTeor: 150, // Reais
  traducaoJuramentada: 200, // Reais
  apostilamentoHaia: 120, // Reais
  certidaoItaliana: 100, // Euros (exemplo)
};

export const taxaCambio = 6.0; // Valor fixo ou buscar da API
