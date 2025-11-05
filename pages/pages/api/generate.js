export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const topic = (req.body?.topic || "").toString().trim();
    if (!topic) return res.status(400).json({ error: "Topic required" });

    let OpenAI;
    try {
      OpenAI = (await import("openai")).default;
    } catch (e) {
      OpenAI = require("openai").default || require("openai");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate 3 short, catchy crypto tweets about: "${topic}". Keep each tweet <= 220 characters. Output strictly JSON: { "tweets":[{"text":"..."}] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a concise social media copywriter specializing in crypto. Do not give financial advice." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const raw = completion?.choices?.[0]?.message?.content || "";
    let parsed = null;
    try {
      const cleaned = raw.trim().replace(/^```json\\n?|```$/g, "");
      parsed = JSON.parse(cleaned);
    } catch (e) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    if (!parsed || !Array.isArray(parsed.tweets)) {
      return res.status(200).json({ tweets: [{ text: typeof raw === "string" ? raw : "Unable to parse model output." }] });
    }

    return res.status(200).json({ tweets: parsed.tweets });
  } catch (err) {
    console.error("Generation error", err);
    return res.status(500).json({ error: "Generation failed", details: String(err) });
  }
}
