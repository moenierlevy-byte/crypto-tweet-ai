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
      const list = Array.isArray(data.tweets) ? data.tweets : [];
      setTweets(list);
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
        <h1>TweetForge</h1>

        <div style={{ marginBottom: 12 }}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Bitcoin halving, Solana NFT drop"
            style={{ width: "100%", padding: 10, fontSize: 16 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={generate} disabled={loading} style={{ padding: "10px 16px" }}>
            {loading ? "Generating..." : "Generate Tweets"}
          </button>
          <button
            onClick={() => {
              setTopic("");
              setTweets([]);
              setError("");
            }}
            style={{ padding: "10px 16px" }}
          >
            Reset
          </button>
        </div>

        {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

        <div style={{ marginTop: 20 }}>
          {tweets.length > 0 && (
            <>
              <h2>Suggestions</h2>
              <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
                {tweets.map((t, i) => (
                  <li key={i} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{t.text}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button
                          onClick={() => navigator.clipboard.writeText(t.text).catch(() => alert("Copy failed"))}
                          style={{ padding: "6px 10px" }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
