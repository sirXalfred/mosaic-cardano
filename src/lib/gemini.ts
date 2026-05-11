export const apiKey = '';
export const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';

export const callGemini = async (prompt: string, systemInstruction = '', responseMimeType = 'text/plain') => {
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  if (responseMimeType === 'application/json') payload.generationConfig = { responseMimeType };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const result = await resp.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text;
};
