import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tweets, setTweets] = useState<{ text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    setTweets([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Generation failed");
      }
      const data = await res.json();
      setTweets(Array.isArray(data.tweets) ? data.tweets : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1>TweetForge — Clean Test</h1>
        <div style={{ marginBottom: 12 }}>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic..." style={{ width: "100%", padding: 10 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={generate} disabled={loading} style={{ padding: "8px 12px" }}>{loading ? "Loading..." : "Call API"}</button>
          <button onClick={() => { setTopic(""); setTweets([]); setError(""); }} style={{ padding: "8px 12px" }}>Reset</button>
        </div>
        {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
        <div style={{ marginTop: 18 }}>
          {tweets.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {tweets.map((t, i) => <li key={i} style={{ padding: 8, border: "1px solid #eee", marginBottom: 8 }}>{t.text}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
