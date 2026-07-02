import React from "react";

export function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = React.useState(false);
  const [reg, setReg] = React.useState(null);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/bolao-copa-2026/sw.js", { scope: "/bolao-copa-2026/" });
        setReg(registration);
        registration.addEventListener("updatefound", () => {
          const newSW = registration.installing;
          if (newSW) {
            newSW.addEventListener("statechange", () => {
              if (newSW.state === "installed" && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            });
          }
        });
      } catch {}
    };

    registerSW();

    const timer = setInterval(async () => {
      try {
        const r = await navigator.serviceWorker.getRegistration("/bolao-copa-2026/");
        r?.update();
      } catch {}
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleUpdate = () => {
    reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  };

  if (!needRefresh) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "#1e3a5f", color: "#fff", padding: "12px 16px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: 12, fontSize: 14, boxShadow: "0 -2px 10px rgba(0,0,0,0.3)"
    }}>
      <span>{"\uD83D\uDCA1"} Nova versão disponível</span>
      <button onClick={handleUpdate} style={{
        background: "#0ea5e9", color: "#fff", border: "none",
        borderRadius: 8, padding: "8px 16px", cursor: "pointer",
        fontWeight: 600, fontSize: 13, whiteSpace: "nowrap"
      }}>
        Atualizar agora
      </button>
    </div>
  );
}
