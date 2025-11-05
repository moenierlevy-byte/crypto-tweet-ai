export default function handler(req, res) {
  // Minimal handler: always works — used to verify Vercel + Next.js build environment.
  res.status(200).json({ ok: true, tweets: [{ text: "API sanity test OK" }] });
}
