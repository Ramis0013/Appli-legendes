export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { sujet, plateforme, ton } = req.body;

  if (!sujet) {
    return res.status(400).json({ error: "Sujet manquant" });
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
      return res.status(500).json({ error: "Erreur API Anthropic", details: data });
    }

    const texte = data.content.map((b) => b.text || "").join("");
    const nettoye = texte.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(nettoye);

    return res.status(200).json({ legendes: parsed.legendes || [] });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur", details: String(e) });
  }
}
