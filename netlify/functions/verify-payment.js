exports.handler = async function (event) {
  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: "session_id manquant" }) };
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: "Erreur Stripe", details: data }) };
    }

    return { statusCode: 200, body: JSON.stringify({ paid: data.payment_status === "paid" }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur", details: String(e) }) };
  }
};
