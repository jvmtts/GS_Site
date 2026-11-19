import { guides } from './guides.js';
import { questionsByGuide } from './questions.js';

export { guides, questionsByGuide };

export const topics = [
  {
    "id": "financas",
    "title": "Finanças públicas",
    "text": "Orçamento, planejamento e controle das despesas.",
    "icon": "coins"
  },
  {
    "id": "direitos",
    "title": "Direitos e cidadania",
    "text": "Acesso à informação, direitos e serviços públicos.",
    "icon": "people"
  },
  {
    "id": "instituicoes",
    "title": "Política e instituições",
    "text": "Quem legisla, administra e fiscaliza.",
    "icon": "building"
  },
  {
    "id": "cidades",
    "title": "Cidades e território",
    "text": "Municípios, serviços e políticas urbanas.",
    "icon": "compass"
  },
  {
    "id": "dados",
    "title": "Dados e transparência",
    "text": "Como encontrar e conferir documentos oficiais.",
    "icon": "chart"
  }
];

const guidesById = new Map(guides.map((guide) => [guide.id, guide]));
const guidesBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

export function getGuideById(id) {
  return guidesById.get(id) ?? null;
}

export function getGuideBySlug(slug) {
  return guidesBySlug.get(slug) ?? null;
}
