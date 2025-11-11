export default async function handler(req, res) {
  const targetUrl = process.env.TARGET_API_URL; // 例如 https://school.edu/v1/chat/completions

  try {
    const body = req.method === "POST" ? await req.json() : null;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || `Bearer ${process.env.SCHOOL_API_KEY || ""}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
