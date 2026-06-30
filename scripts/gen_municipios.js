const fs = require('fs');
const path = require('path');

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputPath = path.join(__dirname, '..', 'municipios_pr.json');
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'municipios.js');

if (!fs.existsSync(inputPath)) {
  console.error('Input file municipios_pr.json not found in project root.');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);

const municipios = data.map((item) => {
  const nome = item.nome;
  const id = `${normalize(nome)}-pr`;
  const regiao = item.microrregiao && item.microrregiao.mesorregiao ? item.microrregiao.mesorregiao.nome : (item['regiao-imediata'] && item['regiao-imediata'].nome) || 'Paraná';
  return {
    id,
    nome,
    regiao,
    populacao: '-',
    coordenadas: null,
  };
});

const content = `export const MUNICIPIOS = ${JSON.stringify(municipios, null, 2)};

export function getMunicipioById(municipioId) {
  return MUNICIPIOS.find((municipio) => municipio.id === municipioId) || MUNICIPIOS[0];
}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf8');
console.log('Written', outputPath, 'with', municipios.length, 'municipios');
