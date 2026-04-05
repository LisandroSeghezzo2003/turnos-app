document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-login");
  const mensaje = document.getElementById("mensaje");

  btn.addEventListener("click", async () => {
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;

    if (!username || !password) {
      mensaje.innerText = "Completá usuario y contraseña";
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const json = await res.json();

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        mensaje.innerText = json.detail || "Error de login";

        document.getElementById("user").value = "";
        document.getElementById("pass").value = "";
        document.getElementById("user").focus();

        setTimeout(() => {
        mensaje.innerText = "";
        }, 3000);
      }
    } catch (error) {
      mensaje.innerText = "Error de conexión";
      console.error(error);
    }
  });
});