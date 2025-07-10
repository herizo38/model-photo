export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || sourceLang === targetLang) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  // data[0] est un tableau de tableaux : [[traduction, original, ...], ...]
  return data[0]?.map((item: [string, ...unknown[]]) => item[0]).join('') || text;
} 