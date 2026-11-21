// IA optionnelle (Claude) — uniquement si l'utilisateur a enregistré sa propre clé API dans les réglages.
const MODEL = 'claude-opus-5-5';
let Anthropic;
async function client() {
  const key = localStorage.getItem('apiKey');
  if (!key) throw new Error('Ajoutez une clé API Anthropic dans Réglages pour utiliser l’IA.');
  if (!Anthropic) Anthropic = (await import('../vendor/anthropic.mjs')).default;
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}
export const hasAI = () => !!localStorage.getItem('apiKey');

const blobToB64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); });

async function sourceBlocks(doc) {
  if (doc.type === 'image' && doc.blob) return [{ type: 'image', source: { type: 'base64', media_type: doc.blob.type || 'image/jpeg', data: await blobToB64(doc.blob) } }];
  if (doc.type === 'pdf' && doc.blob && doc.blob.size < 30e6) return [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: await blobToB64(doc.blob) } }];
  return [{ type: 'text', text: `<cours titre="${doc.title}">\n${doc.text}\n</cours>` }];
}

const SYSTEM = 'Tu es un formateur en soins infirmiers (IFSI, France). Tu rédiges en français, de façon exacte, concise et structurée, à partir du cours fourni uniquement. Tu signales les points à vérifier si le cours semble contenir une erreur.';

async function run({ content, onText, format, effort = 'medium' }) {
  const c = await client();
  const stream = c.beta.messages.stream({
    model: MODEL, max_tokens: 32000, system: SYSTEM,
    betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
    output_config: { effort, ...(format ? { format } : {}) },
    messages: [{ role: 'user', content }],
  });
  if (onText) stream.on('text', (_, snap) => onText(snap));
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('La demande a été refusée par le modèle.');
  return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

export async function aiSummary(doc, onText) {
  const content = [...(await sourceBlocks(doc)), { type: 'text', text: 'Rédige une fiche de révision en Markdown : titres (##), listes à puces, tableaux si utile, valeurs chiffrées et points clés en gras, rôle infirmier et surveillance, puis 5 pièges fréquents aux examens. Pas d’introduction.' }];
  return run({ content, onText });
}
export async function aiTranscribe(doc, onText) {
  const content = [...(await sourceBlocks(doc)), { type: 'text', text: 'Transcris fidèlement tout le texte de ce document (en Markdown simple), sans rien ajouter.' }];
  return run({ content, onText, effort: 'low' });
}
export async function aiAsk(doc, question, onText) {
  const content = [...(await sourceBlocks(doc)), { type: 'text', text: `Question de l’étudiant(e) sur ce cours : ${question}\nRéponds clairement et brièvement, en t’appuyant sur le cours.` }];
  return run({ content, onText });
}
export async function aiQuiz(doc, n = 15) {
  const schema = {
    type: 'object', additionalProperties: false, required: ['questions'],
    properties: { questions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['q', 'correct', 'wrong', 'explain'], properties: { q: { type: 'string' }, correct: { type: 'string' }, wrong: { type: 'array', items: { type: 'string' } }, explain: { type: 'string' } } } } },
  };
  const content = [...(await sourceBlocks(doc)), { type: 'text', text: `Crée ${n} QCM variés (définitions, valeurs, surveillance, conduite à tenir, cas concrets) sur ce cours. Exactement 3 distracteurs plausibles par question.` }];
  const txt = await run({ content, format: { type: 'json_schema', schema } });
  return JSON.parse(txt).questions;
}
