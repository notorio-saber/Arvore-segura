export const MUNICIPIOS = [
  { id: "irati-pr", nome: "Irati", regiao: "Sul do Paraná", populacao: "~100 mil", coordenadas: [-25.4678, -50.6514] },
  { id: "curitiba-pr", nome: "Curitiba", regiao: "Relação metropolitana", populacao: "~1,9 mi", coordenadas: [-25.4284, -49.2733] },
  { id: "londrina-pr", nome: "Londrina", regiao: "Norte do Paraná", populacao: "~575 mil", coordenadas: [-23.3045, -51.1696] },
  { id: "maringa-pr", nome: "Maringá", regiao: "Norte do Paraná", populacao: "~430 mil", coordenadas: [-23.4205, -51.9331] },
  { id: "ponta-grossa-pr", nome: "Ponta Grossa", regiao: "Campos Gerais", populacao: "~360 mil", coordenadas: [-25.095, -50.1614] },
  { id: "cascavel-pr", nome: "Cascavel", regiao: "Oeste do Paraná", populacao: "~340 mil", coordenadas: [-24.9558, -53.4553] },
  { id: "foz-do-iguacu-pr", nome: "Foz do Iguaçu", regiao: "Oeste do Paraná", populacao: "~260 mil", coordenadas: [-25.5478, -54.5882] },
  { id: "guarapuava-pr", nome: "Guarapuava", regiao: "Centro-Sul", populacao: "~180 mil", coordenadas: [-25.3906, -51.465] },
];

export function getMunicipioById(municipioId) {
  return MUNICIPIOS.find((municipio) => municipio.id === municipioId) || MUNICIPIOS[0];
}
