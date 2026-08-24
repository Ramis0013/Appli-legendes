exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  const siteUrl = process.env.URL || "http://localhost:8888";

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${siteUrl}/?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${siteUrl}/`);
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", "eur");
  // Prix par défaut : 4,99€ pour un accès illimité à vie.
  // Pour changer le prix, modifie juste le nombre ci-dessous (en centimes : 499 = 4,99€).
  params.append("line_items[0][price_data][unit_amount]", "499");
  params.append("line_items[0][price_data][product_data][name]", "Accès illimité - Générateur de légendes");

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: "Erreur Stripe", details: data }) };
    }

    return { statusCode: 200, body: JSON.stringify({ url: data.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur", details: String(e) }) };
  }
};
