export const MUNICIPIOS = [
  { id: "irati-pr", nome: "Irati", regiao: "Sul do Paraná", populacao: "~100 mil" },
  { id: "curitiba-pr", nome: "Curitiba", regiao: "Relação metropolitana", populacao: "~1,9 mi" },
  { id: "londrina-pr", nome: "Londrina", regiao: "Norte do Paraná", populacao: "~575 mil" },
  { id: "maringa-pr", nome: "Maringá", regiao: "Norte do Paraná", populacao: "~430 mil" },
  { id: "ponta-grossa-pr", nome: "Ponta Grossa", regiao: "Campos Gerais", populacao: "~360 mil" },
  { id: "cascavel-pr", nome: "Cascavel", regiao: "Oeste do Paraná", populacao: "~340 mil" },
  { id: "foz-do-iguacu-pr", nome: "Foz do Iguaçu", regiao: "Oeste do Paraná", populacao: "~260 mil" },
  { id: "guarapuava-pr", nome: "Guarapuava", regiao: "Centro-Sul", populacao: "~180 mil" },
];

export function getMunicipioById(municipioId) {
  return MUNICIPIOS.find((municipio) => municipio.id === municipioId) || MUNICIPIOS[0];
}
