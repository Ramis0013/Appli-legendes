exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  const { sujet, plateforme, ton } = JSON.parse(event.body || "{}");

  if (!sujet) {
    return { statusCode: 400, body: JSON.stringify({ error: "Sujet manquant" }) };
  }

  const prompt = `Génère 5 légendes courtes et percutantes pour un post ${plateforme} sur le sujet suivant : "${sujet}".
Ton souhaité : ${ton}.
Contraintes :
- Chaque légende doit être autonome, prête à l'emploi.
- Inclure 2-3 hashtags pertinents à la fin de chaque légende (sauf pour LinkedIn où les hashtags doivent être plus discrets et professionnels).
- Varie les accroches (question, chiffre, storytelling, punchline, appel à l'action).
- Réponds UNIQUEMENT avec un objet JSON de la forme {"legendes": ["...", "...", "...", "...", "..."]}, sans texte avant ni après, sans balises markdown.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: "Erreur API Anthropic", details: data }) };
    }

    const texte = data.content.map((b) => b.text || "").join("");
    const nettoye = texte.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(nettoye);

    return { statusCode: 200, body: JSON.stringify({ legendes: parsed.legendes || [] }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur", details: String(e) }) };
  }
};
