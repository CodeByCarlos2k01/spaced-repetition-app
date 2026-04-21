import { AppLanguage } from "../constants/languages";
import { ensureOmwDbReady, openOmwDb } from "../database/omwDb";

function norm(w: string) {
  return w
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^\p{L}\p{N}'-]+/gu, "")
    .trim();
}

function uniqueWords(words: string[]) {
  return Array.from(new Set(words.map(norm).filter(Boolean)));
}

/**
 * Gera candidatos de forma base para tentar encontrar a palavra no dataset.
 * A ordem importa: candidatos mais prováveis vêm primeiro.
 */
function buildEnglishLookupCandidates(word: string): string[] {
  const w = norm(word);
  if (!w) return [];

  const candidates: string[] = [w];

  // Irregulares mais importantes
  const irregularMap: Record<string, string[]> = {
    children: ["child"],
    men: ["man"],
    women: ["woman"],
    mice: ["mouse"],
    geese: ["goose"],
    teeth: ["tooth"],
    feet: ["foot"],
    people: ["person"],
    oxen: ["ox"],
  };

  if (irregularMap[w]) {
    candidates.push(...irregularMap[w]);
  }

  // Plurais em ies -> y
  // babies -> baby
  if (/ies$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ies$/, "y"));
  }

  // Plurais em ves:
  // wolves -> wolf
  // knives -> knife
  if (/ves$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ves$/, "f"));
    candidates.push(w.replace(/ves$/, "fe"));
  }

  // Plurais em es
  // boxes -> box
  // wishes -> wish
  // classes -> class
  if (/(xes|zes|ches|shes|sses|oes)$/.test(w)) {
    candidates.push(w.replace(/es$/, ""));
  }

  // Plural regular
  // cars -> car
  if (/s$/.test(w) && !/ss$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/s$/, ""));
  }

  // Verbos em ied -> y
  // studied -> study
  if (/ied$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ied$/, "y"));
  }

  // Verbos em ed
  // walked -> walk
  // stopped -> stop
  if (/ed$/.test(w) && w.length > 2) {
    const base = w.replace(/ed$/, "");
    candidates.push(base);

    // stopped -> stop / planned -> plan
    if (/([b-df-hj-np-tv-z])\1$/.test(base)) {
      candidates.push(base.slice(0, -1));
    }
  }

  // Verbos em ing
  // running -> run
  // making -> make
  // walking -> walk
  if (/ing$/.test(w) && w.length > 4) {
    const base = w.replace(/ing$/, "");
    candidates.push(base);

    // running -> run / swimming -> swim
    if (/([b-df-hj-np-tv-z])\1$/.test(base)) {
      candidates.push(base.slice(0, -1));
    }

    // making -> make / writing -> write
    candidates.push(base + "e");
  }

  // Comparativo/superlativo
  // happier -> happy
  // happiest -> happy
  if (/ier$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ier$/, "y"));
  }

  if (/iest$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/iest$/, "y"));
  }

  // bigger -> big / biggest -> big
  if (/er$/.test(w) && w.length > 2) {
    const base = w.replace(/er$/, "");
    candidates.push(base);

    if (/([b-df-hj-np-tv-z])\1$/.test(base)) {
      candidates.push(base.slice(0, -1));
    }
  }

  if (/est$/.test(w) && w.length > 3) {
    const base = w.replace(/est$/, "");
    candidates.push(base);

    if (/([b-df-hj-np-tv-z])\1$/.test(base)) {
      candidates.push(base.slice(0, -1));
    }
  }

  return uniqueWords(candidates);
}

function buildSpanishLookupCandidates(word: string): string[] {
  const w = norm(word);
  if (!w) return [];

  const candidates: string[] = [w];

  // Plural em -ces -> singular em -z
  // luces -> luz
  if (/ces$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ces$/, "z"));
  }

  // Plural em -es
  // colores -> color
  // doctores -> doctor
  if (/es$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/es$/, ""));
  }

  // Plural regular em -s
  // casas -> casa
  if (/s$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/s$/, ""));
  }

  // Feminino/plural para masculino singular
  // bonita -> bonito
  // bonitas -> bonito
  // bonitos -> bonito
  if (/as$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/as$/, "a"));
    candidates.push(w.replace(/as$/, "o"));
  }

  if (/os$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/os$/, "o"));
  }

  if (/a$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/a$/, "o"));
  }

  // trabajadora -> trabajador
  if (/adora$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/adora$/, "ador"));
  }

  // trabajadoras -> trabajadora / trabajador
  if (/adoras$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/adoras$/, "adora"));
    candidates.push(w.replace(/adoras$/, "ador"));
  }

  // española -> español
  if (/ola$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ola$/, "ol"));
  }

  // españolas -> española / español
  if (/olas$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/olas$/, "ola"));
    candidates.push(w.replace(/olas$/, "ol"));
  }

  // Gerúndio
  // hablando -> hablar
  // comiendo / viviendo -> comer / vivir
  if (/ando$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ando$/, "ar"));
  }

  if (/(iendo|yendo)$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/iendo$/, "er"));
    candidates.push(w.replace(/iendo$/, "ir"));
    candidates.push(w.replace(/yendo$/, "er"));
    candidates.push(w.replace(/yendo$/, "ir"));
  }

  // Particípio
  // hablado -> hablar
  // comido / vivido -> comer / vivir
  if (/ado$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ado$/, "ar"));
  }

  if (/ido$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ido$/, "er"));
    candidates.push(w.replace(/ido$/, "ir"));
  }

  // Particípio no feminino/plural
  // hablada -> hablar
  // hablados -> hablar
  // habladas -> hablar
  if (/ada$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ada$/, "ado"));
    candidates.push(w.replace(/ada$/, "ar"));
  }

  if (/adas$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/adas$/, "ada"));
    candidates.push(w.replace(/adas$/, "ado"));
    candidates.push(w.replace(/adas$/, "ar"));
  }

  if (/idos$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/idos$/, "ido"));
    candidates.push(w.replace(/idos$/, "er"));
    candidates.push(w.replace(/idos$/, "ir"));
  }

  if (/idas$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/idas$/, "ida"));
    candidates.push(w.replace(/idas$/, "ido"));
    candidates.push(w.replace(/idas$/, "er"));
    candidates.push(w.replace(/idas$/, "ir"));
  }

  // Presente muito comum
  // hablo -> hablar
  // come -> comer / vivir
  // hablan -> hablar
  // comen -> comer / vivir
  if (/o$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/o$/, "ar"));
    candidates.push(w.replace(/o$/, "er"));
    candidates.push(w.replace(/o$/, "ir"));
  }

  if (/a$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/a$/, "ar"));
    candidates.push(w.replace(/a$/, "er"));
    candidates.push(w.replace(/a$/, "ir"));
  }

  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/e$/, "er"));
    candidates.push(w.replace(/e$/, "ir"));
  }

  if (/an$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/an$/, "ar"));
  }

  if (/en$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/en$/, "er"));
    candidates.push(w.replace(/en$/, "ir"));
  }

  if (/amos$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/amos$/, "ar"));
  }

  if (/emos$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/emos$/, "er"));
  }

  if (/imos$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/imos$/, "ir"));
  }

  // Pretérito / imperfeito comuns
  // habló -> hablar
  // hablaron -> hablar
  // hablaba -> hablar
  // comía -> comer / vivir
  if (/ó$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/ó$/, "ar"));
  }

  if (/aron$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/aron$/, "ar"));
  }

  if (/ieron$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ieron$/, "er"));
    candidates.push(w.replace(/ieron$/, "ir"));
  }

  if (/aba$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/aba$/, "ar"));
  }

  if (/aban$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/aban$/, "ar"));
  }

  if (/ía$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ía$/, "er"));
    candidates.push(w.replace(/ía$/, "ir"));
  }

  if (/ían$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ían$/, "er"));
    candidates.push(w.replace(/ían$/, "ir"));
  }

  // Futuro e condicional simples
  // hablaré -> hablar
  // comeré -> comer
  // viviré -> vivir
  if (/aré$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/aré$/, "ar"));
  }

  if (/eré$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/eré$/, "er"));
  }

  if (/iré$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/iré$/, "ir"));
  }

  if (/aría$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/aría$/, "ar"));
  }

  if (/ería$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ería$/, "er"));
  }

  if (/iría$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/iría$/, "ir"));
  }

  // Diminutivos
  // casita -> casa
  // perrito -> perro
  if (/ita$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ita$/, ""));
    candidates.push(w.replace(/ita$/, "a"));
    candidates.push(w.replace(/ita$/, "o"));
  }

  if (/ito$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ito$/, ""));
    candidates.push(w.replace(/ito$/, "o"));
  }

  if (/itas$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/itas$/, ""));
    candidates.push(w.replace(/itas$/, "a"));
    candidates.push(w.replace(/itas$/, "o"));
  }

  if (/itos$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/itos$/, ""));
    candidates.push(w.replace(/itos$/, "o"));
  }

  // Aumentativos
  // grandote -> grande
  if (/ote$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ote$/, ""));
    candidates.push(w.replace(/ote$/, "o"));
    candidates.push(w.replace(/ote$/, "e"));
  }

  if (/ota$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ota$/, ""));
    candidates.push(w.replace(/ota$/, "a"));
    candidates.push(w.replace(/ota$/, "o"));
    candidates.push(w.replace(/ota$/, "e"));
  }

  if (/otes$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/otes$/, ""));
    candidates.push(w.replace(/otes$/, "o"));
    candidates.push(w.replace(/otes$/, "e"));
  }

  if (/otas$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/otas$/, ""));
    candidates.push(w.replace(/otas$/, "a"));
    candidates.push(w.replace(/otas$/, "o"));
    candidates.push(w.replace(/otas$/, "e"));
  }

  // Advérbios em -mente
  // lentamente -> lenta / lento
  if (/mente$/.test(w) && w.length > 6) {
    const base = w.replace(/mente$/, "");
    candidates.push(base);
    candidates.push(base + "o");
    candidates.push(base + "a");
  }

  return uniqueWords(candidates);
}

function buildItalianLookupCandidates(word: string): string[] {
  const w = norm(word);
  if (!w) return [];

  const candidates: string[] = [w];

  // =========================
  // PLURAL / GÊNERO
  // =========================

  // libri -> libro
  // belli -> bello
  if (/i$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/i$/, "o"));
  }

  // case -> casa
  // belle -> bella
  if (/e$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/e$/, "a"));
  }

  // noite/common plural masculine/feminine fallback
  // cani -> cane
  // studenti -> studente
  if (/i$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/i$/, "e"));
  }

  // parole -> parola
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/e$/, "o"));
  }

  // bella -> bello
  if (/a$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/a$/, "o"));
  }

  // belle -> bella / bello
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/e$/, "a"));
    candidates.push(w.replace(/e$/, "o"));
  }

  // belli -> bello / belle
  if (/i$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/i$/, "o"));
    candidates.push(w.replace(/i$/, "e"));
  }

  // amica -> amico
  // amiche -> amica / amico
  if (/ca$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ca$/, "co"));
  }

  if (/che$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/che$/, "ca"));
    candidates.push(w.replace(/che$/, "co"));
  }

  // amica -> amico / amici -> amico
  if (/ci$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ci$/, "co"));
    candidates.push(w.replace(/ci$/, "ca"));
  }

  // lunga -> lungo / lunghe -> lunga / lungo
  if (/ga$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ga$/, "go"));
  }

  if (/ghe$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ghe$/, "ga"));
    candidates.push(w.replace(/ghe$/, "go"));
  }

  if (/ghi$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ghi$/, "go"));
    candidates.push(w.replace(/ghi$/, "ga"));
  }

  // attrice -> attore
  if (/trice$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/trice$/, "tore"));
  }

  // dottoressa -> dottore
  if (/essa$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/essa$/, "e"));
    candidates.push(w.replace(/essa$/, "ore"));
  }

  // dottoresse -> dottoressa / dottore
  if (/esse$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/esse$/, "essa"));
    candidates.push(w.replace(/esse$/, "e"));
    candidates.push(w.replace(/esse$/, "ore"));
  }

  // =========================
  // SUPERLATIVO / ADVÉRBIOS
  // =========================

  // bellissimo -> bello
  if (/issimo$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/issimo$/, ""));
    candidates.push(w.replace(/issimo$/, "o"));
  }

  // bellissima -> bella / bello
  if (/issima$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/issima$/, ""));
    candidates.push(w.replace(/issima$/, "a"));
    candidates.push(w.replace(/issima$/, "o"));
  }

  // bellissimi -> bellissimo / bello
  if (/issimi$/.test(w) && w.length > 8) {
    candidates.push(w.replace(/issimi$/, "issimo"));
    candidates.push(w.replace(/issimi$/, ""));
    candidates.push(w.replace(/issimi$/, "o"));
  }

  // bellissime -> bellissima / bella / bello
  if (/issime$/.test(w) && w.length > 8) {
    candidates.push(w.replace(/issime$/, "issima"));
    candidates.push(w.replace(/issime$/, ""));
    candidates.push(w.replace(/issime$/, "a"));
    candidates.push(w.replace(/issime$/, "o"));
  }

  // lentamente -> lenta / lento / lento-like base
  if (/mente$/.test(w) && w.length > 6) {
    const base = w.replace(/mente$/, "");
    candidates.push(base);
    candidates.push(base + "o");
    candidates.push(base + "a");

    // normalmente -> normale
    if (/al$/.test(base) && base.length > 3) {
      candidates.push(base + "e");
    }
  }

  // =========================
  // DIMINUTIVOS / AUMENTATIVOS
  // =========================

  // casetta -> casa / casetto
  if (/etta$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/etta$/, ""));
    candidates.push(w.replace(/etta$/, "a"));
    candidates.push(w.replace(/etta$/, "o"));
  }

  if (/ette$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ette$/, ""));
    candidates.push(w.replace(/ette$/, "a"));
    candidates.push(w.replace(/ette$/, "o"));
  }

  if (/etti$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/etti$/, ""));
    candidates.push(w.replace(/etti$/, "o"));
    candidates.push(w.replace(/etti$/, "a"));
  }

  // ragazzino -> ragazzo
  if (/ino$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ino$/, ""));
    candidates.push(w.replace(/ino$/, "o"));
  }

  if (/ina$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ina$/, ""));
    candidates.push(w.replace(/ina$/, "a"));
    candidates.push(w.replace(/ina$/, "o"));
  }

  if (/ini$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ini$/, ""));
    candidates.push(w.replace(/ini$/, "o"));
    candidates.push(w.replace(/ini$/, "a"));
  }

  if (/ine$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ine$/, ""));
    candidates.push(w.replace(/ine$/, "a"));
    candidates.push(w.replace(/ine$/, "o"));
  }

  // librone -> libro
  if (/one$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/one$/, ""));
    candidates.push(w.replace(/one$/, "o"));
    candidates.push(w.replace(/one$/, "a"));
  }

  if (/ona$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ona$/, ""));
    candidates.push(w.replace(/ona$/, "a"));
    candidates.push(w.replace(/ona$/, "o"));
  }

  if (/oni$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/oni$/, ""));
    candidates.push(w.replace(/oni$/, "o"));
    candidates.push(w.replace(/oni$/, "a"));
  }

  if (/one$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/one$/, "e"));
  }

  // =========================
  // GERÚNDIO
  // =========================

  // parlando -> parlare
  if (/ando$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ando$/, "are"));
  }

  // vendendo -> vendere / finire
  if (/endo$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/endo$/, "ere"));
    candidates.push(w.replace(/endo$/, "ire"));
  }

  // =========================
  // PARTICÍPIO PASSADO
  // =========================

  // parlato -> parlare
  if (/ato$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ato$/, "are"));
  }

  // parlata / parlati / parlate
  if (/ata$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ata$/, "ato"));
    candidates.push(w.replace(/ata$/, "are"));
  }

  if (/ati$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ati$/, "ato"));
    candidates.push(w.replace(/ati$/, "are"));
  }

  if (/ate$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ate$/, "ata"));
    candidates.push(w.replace(/ate$/, "ato"));
    candidates.push(w.replace(/ate$/, "are"));
  }

  // venduto -> vendere
  if (/uto$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/uto$/, "ere"));
  }

  if (/uta$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/uta$/, "uto"));
    candidates.push(w.replace(/uta$/, "ere"));
  }

  if (/uti$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/uti$/, "uto"));
    candidates.push(w.replace(/uti$/, "ere"));
  }

  if (/ute$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ute$/, "uta"));
    candidates.push(w.replace(/ute$/, "uto"));
    candidates.push(w.replace(/ute$/, "ere"));
  }

  // finito -> finire
  if (/ito$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ito$/, "ire"));
  }

  if (/ita$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ita$/, "ito"));
    candidates.push(w.replace(/ita$/, "ire"));
  }

  if (/iti$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/iti$/, "ito"));
    candidates.push(w.replace(/iti$/, "ire"));
  }

  if (/ite$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ite$/, "ita"));
    candidates.push(w.replace(/ite$/, "ito"));
    candidates.push(w.replace(/ite$/, "ire"));
  }

  // =========================
  // INFINITIVO A PARTIR DE FORMAS COMUNS
  // PRESENTE
  // =========================

  // parlo -> parlare / vendere / finire
  if (/o$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/o$/, "are"));
    candidates.push(w.replace(/o$/, "ere"));
    candidates.push(w.replace(/o$/, "ire"));
  }

  // parla -> parlare
  if (/a$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/a$/, "are"));
  }

  // vende -> vendere / finire
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/e$/, "ere"));
    candidates.push(w.replace(/e$/, "ire"));
  }

  // parlano -> parlare
  if (/ano$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ano$/, "are"));
  }

  // vendono -> vendere / finire
  if (/ono$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ono$/, "ere"));
    candidates.push(w.replace(/ono$/, "ire"));
  }

  // finite / partite -> finire / partire
  if (/ite$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ite$/, "ire"));
  }

  // parli -> parlare
  if (/i$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/i$/, "are"));
    candidates.push(w.replace(/i$/, "ere"));
    candidates.push(w.replace(/i$/, "ire"));
  }

  // =========================
  // IMPERFEITO
  // =========================

  // parlavo -> parlare
  if (/avo$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/avo$/, "are"));
  }

  if (/avi$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/avi$/, "are"));
  }

  if (/ava$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ava$/, "are"));
  }

  if (/avamo$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/avamo$/, "are"));
  }

  if (/avate$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/avate$/, "are"));
  }

  if (/avano$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/avano$/, "are"));
  }

  // vendevo / finivo
  if (/evo$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/evo$/, "ere"));
  }

  if (/evi$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/evi$/, "ere"));
  }

  if (/eva$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/eva$/, "ere"));
  }

  if (/evamo$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/evamo$/, "ere"));
  }

  if (/evate$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/evate$/, "ere"));
  }

  if (/evano$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/evano$/, "ere"));
  }

  if (/ivo$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ivo$/, "ire"));
  }

  if (/ivi$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ivi$/, "ire"));
  }

  if (/iva$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/iva$/, "ire"));
  }

  if (/ivamo$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/ivamo$/, "ire"));
  }

  if (/ivate$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/ivate$/, "ire"));
  }

  if (/ivano$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/ivano$/, "ire"));
  }

  // =========================
  // FUTURO SIMPLES
  // =========================

  // parlerò / venderò / finirò
  if (/erò$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/erò$/, "are"));
    candidates.push(w.replace(/erò$/, "ere"));
  }

  if (/irò$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/irò$/, "ire"));
  }

  // parlerai / venderai / finirai
  if (/erai$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/erai$/, "are"));
    candidates.push(w.replace(/erai$/, "ere"));
  }

  if (/irai$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/irai$/, "ire"));
  }

  // parlerà / venderà / finirà
  if (/erà$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/erà$/, "are"));
    candidates.push(w.replace(/erà$/, "ere"));
  }

  if (/irà$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/irà$/, "ire"));
  }

  // parleremo / venderemo / finiremo
  if (/eremo$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/eremo$/, "are"));
    candidates.push(w.replace(/eremo$/, "ere"));
  }

  if (/iremo$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/iremo$/, "ire"));
  }

  // parlerete / venderete / finirete
  if (/erete$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/erete$/, "are"));
    candidates.push(w.replace(/erete$/, "ere"));
  }

  if (/irete$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/irete$/, "ire"));
  }

  // parleranno / venderanno / finiranno
  if (/eranno$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/eranno$/, "are"));
    candidates.push(w.replace(/eranno$/, "ere"));
  }

  if (/iranno$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/iranno$/, "ire"));
  }

  // =========================
  // CONDIZIONALE
  // =========================

  // parlerei / venderei / finirei
  if (/erei$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/erei$/, "are"));
    candidates.push(w.replace(/erei$/, "ere"));
  }

  if (/irei$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/irei$/, "ire"));
  }

  if (/eresti$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/eresti$/, "are"));
    candidates.push(w.replace(/eresti$/, "ere"));
  }

  if (/iresti$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/iresti$/, "ire"));
  }

  if (/erebbe$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/erebbe$/, "are"));
    candidates.push(w.replace(/erebbe$/, "ere"));
  }

  if (/irebbe$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/irebbe$/, "ire"));
  }

  if (/eremmo$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/eremmo$/, "are"));
    candidates.push(w.replace(/eremmo$/, "ere"));
  }

  if (/iremmo$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/iremmo$/, "ire"));
  }

  if (/ereste$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/ereste$/, "are"));
    candidates.push(w.replace(/ereste$/, "ere"));
  }

  if (/ireste$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/ireste$/, "ire"));
  }

  if (/erebbero$/.test(w) && w.length > 8) {
    candidates.push(w.replace(/erebbero$/, "are"));
    candidates.push(w.replace(/erebbero$/, "ere"));
  }

  if (/irebbero$/.test(w) && w.length > 8) {
    candidates.push(w.replace(/irebbero$/, "ire"));
  }

  // =========================
  // PASSATO REMOTO
  // =========================

  // parlai -> parlare
  if (/ai$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ai$/, "are"));
  }

  if (/asti$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/asti$/, "are"));
  }

  if (/ò$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/ò$/, "are"));
  }

  if (/ammo$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ammo$/, "are"));
  }

  if (/aste$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/aste$/, "are"));
  }

  if (/arono$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/arono$/, "are"));
  }

  // vendetti / credetti -> vendere / credere
  if (/etti$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/etti$/, "ere"));
  }

  if (/ette$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/ette$/, "ere"));
  }

  if (/ettero$/.test(w) && w.length > 7) {
    candidates.push(w.replace(/ettero$/, "ere"));
  }

  // finii / partii -> finire / partire
  if (/ii$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/ii$/, "ire"));
  }

  if (/isti$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/isti$/, "ire"));
  }

  if (/ì$/.test(w) && w.length > 2) {
    candidates.push(w.replace(/ì$/, "ire"));
  }

  if (/immo$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/immo$/, "ire"));
  }

  if (/iste$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/iste$/, "ire"));
  }

  if (/irono$/.test(w) && w.length > 6) {
    candidates.push(w.replace(/irono$/, "ire"));
  }

  // =========================
  // IMPERATIVO / INFINITIVO COM PRONOMES
  // =========================

  // farlo, dirgli, parlami, portatelo...
  const pronounSuffixes = [
    "glielo", "gliela", "glieli", "gliele",
    "melo", "mela", "meli", "mele",
    "telo", "tela", "teli", "tele",
    "celo", "cela", "celi", "cele",
    "velo", "vela", "veli", "vele",
    "selo", "sela", "seli", "sele",
    "gli", "ci", "vi", "mi", "ti", "si",
    "lo", "la", "li", "le", "ne"
  ];

  for (const suffix of pronounSuffixes) {
    if (w.endsWith(suffix) && w.length > suffix.length + 2) {
      const base = w.slice(0, -suffix.length);
      candidates.push(base);

      // farlo -> fare / parlarci -> parlare / sentirla -> sentire
      if (!/[aeiou]re$/.test(base)) {
        candidates.push(base + "are");
        candidates.push(base + "ere");
        candidates.push(base + "ire");
      }
    }
  }

  return uniqueWords(candidates);
}

function buildFrenchLookupCandidates(word: string): string[] {
  const w = norm(word);
  if (!w) return [];

  const candidates: string[] = [w];

  // =========================
  // PLURAL
  // =========================

  // chats -> chat
  if (/s$/.test(w) && w.length > 2) {
    candidates.push(w.slice(0, -1));
  }

  // chevaux -> cheval
  if (/aux$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/aux$/, "al"));
  }

  // journaux -> journal
  if (/eaux$/.test(w) && w.length > 5) {
    candidates.push(w.replace(/eaux$/, "eau"));
  }

  // =========================
  // FEMININO / MASCULINO
  // =========================

  // petite -> petit
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }

  // grandes -> grand / grande
  if (/es$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/es$/, ""));
    candidates.push(w.replace(/es$/, "e"));
  }

  // heureuse -> heureux
  if (/euse$/.test(w)) {
    candidates.push(w.replace(/euse$/, "eux"));
  }

  // nerveuse -> nerveux
  if (/euses$/.test(w)) {
    candidates.push(w.replace(/euses$/, "eux"));
  }

  // actif -> active / actifs -> actif
  if (/ive$/.test(w)) {
    candidates.push(w.replace(/ive$/, "if"));
  }

  if (/ives$/.test(w)) {
    candidates.push(w.replace(/ives$/, "if"));
  }

  // =========================
  // ADVÉRBIOS
  // =========================

  // rapidement -> rapide
  if (/ment$/.test(w) && w.length > 5) {
    const base = w.replace(/ment$/, "");
    candidates.push(base);
    candidates.push(base + "e");

    // sérieusement -> sérieux
    if (/euse$/.test(base)) {
      candidates.push(base.replace(/euse$/, "eux"));
    }
  }

  // =========================
  // PARTICÍPIO PASSADO
  // =========================

  // parlé -> parler
  if (/é$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/é$/, "er"));
  }

  // parlée / parlées
  if (/ée$/.test(w)) {
    candidates.push(w.replace(/ée$/, "er"));
    candidates.push(w.replace(/ée$/, "é"));
  }

  if (/ées$/.test(w)) {
    candidates.push(w.replace(/ées$/, "er"));
    candidates.push(w.replace(/ées$/, "é"));
  }

  // finis -> finir
  if (/i$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/i$/, "ir"));
  }

  // fini / finis / finie / finies
  if (/ie$/.test(w)) {
    candidates.push(w.replace(/ie$/, "ir"));
    candidates.push(w.replace(/ie$/, "i"));
  }

  if (/ies$/.test(w)) {
    candidates.push(w.replace(/ies$/, "ir"));
    candidates.push(w.replace(/ies$/, "i"));
  }

  // vendu -> vendre
  if (/u$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/u$/, "re"));
  }

  // =========================
  // GERÚNDIO
  // =========================

  // parlant -> parler
  if (/ant$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ant$/, "er"));
    candidates.push(w.replace(/ant$/, "ir"));
    candidates.push(w.replace(/ant$/, "re"));
  }

  // =========================
  // PRESENTE
  // =========================

  // parle -> parler
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/e$/, "er"));
  }

  // parles / parlent
  if (/ent$/.test(w)) {
    candidates.push(w.replace(/ent$/, "er"));
  }

  // finis -> finir
  if (/is$/.test(w)) {
    candidates.push(w.replace(/is$/, "ir"));
  }

  // finit
  if (/it$/.test(w)) {
    candidates.push(w.replace(/it$/, "ir"));
  }

  // vend -> vendre
  if (/d$/.test(w) && w.length > 3) {
    candidates.push(w + "re");
  }

  // =========================
  // IMPARFAIT
  // =========================

  // parlais -> parler
  if (/ais$/.test(w)) {
    candidates.push(w.replace(/ais$/, "er"));
  }

  if (/ait$/.test(w)) {
    candidates.push(w.replace(/ait$/, "er"));
  }

  if (/aient$/.test(w)) {
    candidates.push(w.replace(/aient$/, "er"));
  }

  // finissais -> finir
  if (/issais$/.test(w)) {
    candidates.push(w.replace(/issais$/, "ir"));
  }

  // =========================
  // FUTURO
  // =========================

  // parlera -> parler
  if (/era$/.test(w)) {
    candidates.push(w.replace(/era$/, "er"));
  }

  if (/erai$/.test(w)) {
    candidates.push(w.replace(/erai$/, "er"));
  }

  if (/eront$/.test(w)) {
    candidates.push(w.replace(/eront$/, "er"));
  }

  // finira
  if (/ira$/.test(w)) {
    candidates.push(w.replace(/ira$/, "ir"));
  }

  if (/iront$/.test(w)) {
    candidates.push(w.replace(/iront$/, "ir"));
  }

  // vendra
  if (/ra$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/ra$/, "re"));
  }

  // =========================
  // CONDICIONAL
  // =========================

  // parlerais
  if (/erais$/.test(w)) {
    candidates.push(w.replace(/erais$/, "er"));
  }

  if (/erait$/.test(w)) {
    candidates.push(w.replace(/erait$/, "er"));
  }

  if (/eraient$/.test(w)) {
    candidates.push(w.replace(/eraient$/, "er"));
  }

  // finirais
  if (/irais$/.test(w)) {
    candidates.push(w.replace(/irais$/, "ir"));
  }

  // =========================
  // PASSÉ SIMPLE
  // =========================

  // parla -> parler
  if (/a$/.test(w) && w.length > 3) {
    candidates.push(w.replace(/a$/, "er"));
  }

  // finit
  if (/it$/.test(w)) {
    candidates.push(w.replace(/it$/, "ir"));
  }

  // =========================
  // PRONOMES COLADOS
  // =========================

  const pronouns = [
    "moi", "toi", "lui", "nous", "vous", "leur",
    "le", "la", "les", "en", "y"
  ];

  for (const p of pronouns) {
    if (w.endsWith(p) && w.length > p.length + 2) {
      const base = w.slice(0, -p.length);
      candidates.push(base);

      candidates.push(base + "er");
      candidates.push(base + "ir");
      candidates.push(base + "re");
    }
  }

  return uniqueWords(candidates);
}

function buildGermanLookupCandidates(word: string): string[] {
  const w = norm(word);
  if (!w) return [];

  const candidates: string[] = [w];

  // =========================
  // NORMALIZAÇÃO UMLAUT
  // =========================

  candidates.push(w.replace(/ä/g, "a"));
  candidates.push(w.replace(/ö/g, "o"));
  candidates.push(w.replace(/ü/g, "u"));
  candidates.push(w.replace(/ß/g, "ss"));

  // =========================
  // PLURAL (muito variado)
  // =========================

  // Autos -> Auto
  if (/s$/.test(w) && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }

  // Hunde -> Hund
  if (/e$/.test(w) && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }

  // Kinder -> Kind
  if (/er$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/er$/, ""));
  }

  // Frauen -> Frau
  if (/en$/.test(w) && w.length > 4) {
    candidates.push(w.replace(/en$/, ""));
  }

  // Bücher -> Buch
  if (/er$/.test(w)) {
    const base = w.replace(/er$/, "");
    candidates.push(base);
    candidates.push(base.replace(/ä/g, "a"));
  }

  // =========================
  // SUBSTANTIVOS (declinação)
  // =========================

  // dem Mann -> Mann
  if (/n$/.test(w) && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }

  // des Hauses -> Haus
  if (/es$/.test(w)) {
    candidates.push(w.replace(/es$/, ""));
  }

  // =========================
  // ADJETIVOS
  // =========================

  // große -> groß
  if (/e$/.test(w)) {
    candidates.push(w.replace(/e$/, ""));
  }

  // großen -> groß
  if (/en$/.test(w)) {
    candidates.push(w.replace(/en$/, ""));
  }

  // großer -> groß
  if (/er$/.test(w)) {
    candidates.push(w.replace(/er$/, ""));
  }

  // großes -> groß
  if (/es$/.test(w)) {
    candidates.push(w.replace(/es$/, ""));
  }

  // =========================
  // COMPARATIVO / SUPERLATIVO
  // =========================

  // größer -> groß
  if (/er$/.test(w)) {
    candidates.push(w.replace(/er$/, ""));
  }

  // am größten -> groß
  if (/sten$/.test(w)) {
    candidates.push(w.replace(/sten$/, ""));
  }

  if (/ste$/.test(w)) {
    candidates.push(w.replace(/ste$/, ""));
  }

  // =========================
  // VERBOS - PRESENTE
  // =========================

  // mache -> machen
  if (/e$/.test(w)) {
    candidates.push(w + "n");
  }

  // machst -> machen
  if (/st$/.test(w)) {
    candidates.push(w.replace(/st$/, "en"));
  }

  // macht -> machen
  if (/t$/.test(w)) {
    candidates.push(w.replace(/t$/, "en"));
  }

  // machet (variação antiga)
  if (/et$/.test(w)) {
    candidates.push(w.replace(/et$/, "en"));
  }

  // =========================
  // VERBOS - PARTICÍPIO
  // =========================

  // gemacht -> machen
  if (/^ge.*t$/.test(w)) {
    const base = w.replace(/^ge/, "").replace(/t$/, "");
    candidates.push(base);
    candidates.push(base + "en");
  }

  // gesehen -> sehen
  if (/^ge.*en$/.test(w)) {
    const base = w.replace(/^ge/, "").replace(/en$/, "");
    candidates.push(base + "en");
  }

  // =========================
  // VERBOS - INFINITIVO
  // =========================

  // fallback genérico
  if (!/en$/.test(w) && w.length > 3) {
    candidates.push(w + "en");
  }

  // =========================
  // PREFIXOS INSEPARÁVEIS
  // =========================

  const inseparablePrefixes = [
    "be", "emp", "ent", "er", "ge", "miss", "ver", "zer"
  ];

  for (const p of inseparablePrefixes) {
    if (w.startsWith(p) && w.length > p.length + 3) {
      const base = w.slice(p.length);
      candidates.push(base);
      candidates.push(base + "en");
    }
  }

  // =========================
  // PREFIXOS SEPARÁVEIS
  // =========================

  const separablePrefixes = [
    "ab", "an", "auf", "aus", "bei", "ein", "mit",
    "nach", "vor", "weg", "zu", "zurück"
  ];

  for (const p of separablePrefixes) {
    if (w.endsWith(p) && w.length > p.length + 3) {
      const base = w.slice(0, -p.length);
      candidates.push(base);
      candidates.push(base + "en");
    }
  }

  // =========================
  // COMPOSTOS (alemão clássico)
  // =========================

  // Krankenhausverwaltung -> Krankenhaus / Verwaltung
  for (let i = 4; i < w.length - 4; i++) {
    const left = w.slice(0, i);
    const right = w.slice(i);

    candidates.push(left);
    candidates.push(right);
  }

  // =========================
  // DIMINUTIVOS
  // =========================

  // Mädchen -> Magd (aproximação)
  if (/chen$/.test(w)) {
    candidates.push(w.replace(/chen$/, ""));
  }

  if (/lein$/.test(w)) {
    candidates.push(w.replace(/lein$/, ""));
  }

  // =========================
  // PRONOMES / PARTÍCULAS
  // =========================

  const suffixes = ["ich", "du", "er", "sie", "es", "wir", "ihr"];

  for (const s of suffixes) {
    if (w.endsWith(s) && w.length > s.length + 3) {
      const base = w.slice(0, -s.length);
      candidates.push(base);
      candidates.push(base + "en");
    }
  }

  return uniqueWords(candidates);
}

function buildLookupCandidates(word: string, language: AppLanguage): string[] {
  if (language === "es") return buildSpanishLookupCandidates(word);
  if (language === "ita") return buildItalianLookupCandidates(word);
  if (language === "fr") return buildFrenchLookupCandidates(word);
  if (language === "de") return buildGermanLookupCandidates(word);

  return buildEnglishLookupCandidates(word);
}

function getTranslationsRow(en: string, language: AppLanguage) {
  const db = openOmwDb(language);

  return db.getFirstSync<{ pt_json: string }>(
    "SELECT pt_json FROM translations WHERE en = ?",
    [en]
  );
}

function parsePtJson(pt_json?: string): string[] {
  if (!pt_json) return [];

  try {
    const arr = JSON.parse(pt_json) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Faz a busca com fallback:
 * 1. tenta a palavra original
 * 2. se não achar, tenta candidatos normalizados
 */
export async function buscarTraducoesComFallback(palavra: string, language: AppLanguage): Promise<{
  originalWord: string;
  resolvedWord: string;
  translations: string[];
}> {
  const originalWord = norm(palavra);
  if (!originalWord) {
    return {
      originalWord: "",
      resolvedWord: "",
      translations: [],
    };
  }

  await ensureOmwDbReady(language);

  const candidates = buildLookupCandidates(originalWord, language);

  for (const candidate of candidates) {
    const row = getTranslationsRow(candidate, language);
    const translations = parsePtJson(row?.pt_json);

    if (translations.length) {
      return {
        originalWord,
        resolvedWord: candidate,
        translations,
      };
    }
  }

  return {
    originalWord,
    resolvedWord: "",
    translations: [],
  };
}

export async function traduzirPalavra(palavra: string, language: AppLanguage): Promise<string> {
  const result = await buscarTraducoesComFallback(palavra, language);
  return result.translations[0] ?? "";
}

export async function listarTraducoes(palavra: string, language: AppLanguage): Promise<string[]> {
  const result = await buscarTraducoesComFallback(palavra, language);
  return result.translations;
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
  excluirLinhas: string[],
  language: AppLanguage
): Promise<string[]> {
  await ensureOmwDbReady(language);
  const db = openOmwDb(language);

  const excludeSet = new Set((excluirLinhas ?? []).map(s => s.trim()).filter(Boolean));

  const resultados: string[] = [];
  let tentativas = 0;

  while (resultados.length < quantidade && tentativas < 6) {
    tentativas++;

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