import { ensureOmwDbReady, openOmwDb } from "../database/omwDb";

function norm(w: string) {
  return w
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^\p{L}\p{N}'-]+/gu, "")
    .trim();
}

export async function traduzirPalavra(palavra: string): Promise<string> {
  const w = norm(palavra);
  if (!w) return "";

  await ensureOmwDbReady();
  const db = openOmwDb();

  const row = db.getFirstSync<{ pt_json: string }>(
    "SELECT pt_json FROM translations WHERE en = ?",
    [w]
  );

  if (!row?.pt_json) return "";

  try {
    const arr = JSON.parse(row.pt_json) as string[];
    return arr?.[0] ?? "";
  } catch {
    return "";
  }
}

// Se você quiser retornar várias opções para o usuário escolher:
export async function listarTraducoes(palavra: string): Promise<string[]> {
  const w = norm(palavra);
  if (!w) return [];

  await ensureOmwDbReady();
  const db = openOmwDb();

  const row = db.getFirstSync<{ pt_json: string }>(
    "SELECT pt_json FROM translations WHERE en = ?",
    [w]
  );

  if (!row?.pt_json) return [];
  try {
    const arr = JSON.parse(row.pt_json) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatarTraducoesUmaLinha(traducoes: string[]) {
  const uniq = Array.from(new Set((traducoes ?? []).map(t => t.trim()).filter(Boolean)));
  return uniq.join(", ");
}

/**
 * Retorna linhas aleatórias do dataset OMW, no formato:
 * "cão, cachorro"
 *
 * - `excluirLinhas`: evita retornar a opção correta ou opções já escolhidas
 * - Busca mais do que precisa e filtra até completar
 */
export async function obterLinhasDeTraducaoAleatorias(
  quantidade: number,
  excluirLinhas: string[]
): Promise<string[]> {
  await ensureOmwDbReady();
  const db = openOmwDb();

  const excludeSet = new Set((excluirLinhas ?? []).map(s => s.trim()).filter(Boolean));

  const resultados: string[] = [];
  let tentativas = 0;

  // Vamos tentar algumas rodadas para garantir preencher
  while (resultados.length < quantidade && tentativas < 6) {
    tentativas++;

    // Busca um pouco a mais para aumentar a chance de preencher sem repetir
    const need = quantidade - resultados.length;
    const limit = Math.max(need * 5, 20);

    const rows = db.getAllSync<{ pt_json: string }>(
      `SELECT pt_json FROM translations ORDER BY RANDOM() LIMIT ?`,
      [limit]
    );

    for (const r of rows) {
      if (!r?.pt_json) continue;

      let arr: string[] = [];
      try {
        arr = JSON.parse(r.pt_json);
      } catch {
        continue;
      }
      if (!Array.isArray(arr) || arr.length === 0) continue;

      const linha = formatarTraducoesUmaLinha(arr);
      if (!linha) continue;

      if (excludeSet.has(linha)) continue;

      excludeSet.add(linha);
      resultados.push(linha);

      if (resultados.length >= quantidade) break;
    }
  }

  return resultados;
}