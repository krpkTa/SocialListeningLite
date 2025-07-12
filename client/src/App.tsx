import React from "react";

const TELEGRAM_API = "/api/telegram";

type TelegramPost = {
  id: string;
  content: string;
  createdAt: string;
  channelName: string;
  platform: string;
};

function TelegramAuthAndSearch() {
  const [step, setStep] = React.useState("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [phoneCodeHash, setPhoneCodeHash] = React.useState("");
  const [session, setSession] = React.useState(localStorage.getItem("tgSession") || "");
  const [channel, setChannel] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [posts, setPosts] = React.useState<TelegramPost[]>([]);
  const [error, setError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // 1. Отправка кода
  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${TELEGRAM_API}/sendCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.phoneCodeHash && data.session) {
        setPhoneCodeHash(data.phoneCodeHash);
        setSession(data.session);
        localStorage.setItem("tgSession", data.session);
        setStep("code");
      } else {
        setError(data.error || "Ошибка отправки кода");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 2. Подтверждение кода
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      type SignInPayload = { phone: string; code: string; session: string; password?: string };
      const payload: SignInPayload = { phone, code, session };
      if (password) payload.password = password;
      const res = await fetch(`${TELEGRAM_API}/signInWithCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        localStorage.setItem("tgSession", data.session);
        setStep("search");
      } else if (data.error === "SESSION_PASSWORD_NEEDED") {
        setShowPassword(true);
      } else {
        setError(data.error || "Ошибка авторизации");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 3. Поиск постов
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${TELEGRAM_API}/getPosts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, channelName: channel, query }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setError(data.error || "Ошибка поиска");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Telegram Auth & Search</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

      {step === "phone" && (
        <form onSubmit={handleSendCode}>
          <input
            type="tel"
            placeholder="Телефон (например, +79991234567)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit" style={{ width: "100%" }}>Получить код</button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="Код из Telegram"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          {showPassword && (
            <input
              type="password"
              placeholder="Пароль (2FA)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 8 }}
            />
          )}
          <button type="submit" style={{ width: "100%" }}>Войти</button>
        </form>
      )}

      {step === "search" && (
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Канал (например, @durov)"
            value={channel}
            onChange={e => setChannel(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Поисковый запрос"
            value={query}
            onChange={e => setQuery(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit" style={{ width: "100%" }}>Искать посты</button>
        </form>
      )}

      {posts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Результаты:</h4>
          <ul>
            {posts.map(post => (
              <li key={post.id}>
                <div><b>{post.createdAt}</b></div>
                <div>{post.content}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function App() {
  return <TelegramAuthAndSearch />;
}

export default App;
