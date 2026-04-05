document.addEventListener("DOMContentLoaded", async () => {
  const btnCambiar = document.getElementById("btn-cambiar-credenciales");
  const btnLogout = document.getElementById("btn-logout");
  const mensaje = document.getElementById("mensaje-credenciales");

  try {
    const auth = await fetch("/me");

    if (!auth.ok) {
      window.location.href = "/admin";
      return;
    }
  } catch (error) {
    window.location.href = "/admin";
    return;
  }

  btnCambiar.addEventListener("click", async () => {
    const usernameActual = document.getElementById("cred-actual").value;
    const nuevoUsername = document.getElementById("cred-nuevo-user").value;
    const nuevaPassword = document.getElementById("cred-nueva-pass").value;

    if (!usernameActual || !nuevoUsername || !nuevaPassword) {
      mensaje.innerText = "Completá todos los campos";
      return;
    }

    try {
      const res = await fetch("/admins/credenciales", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username_actual: usernameActual,
          nuevo_username: nuevoUsername,
          nueva_password: nuevaPassword
        })
      });

      const json = await res.json();
      mensaje.innerText = json.mensaje || json.error;

      if (res.ok && json.mensaje) {
        alert("Tus credenciales se actualizaron. Iniciá sesión nuevamente.");
        await fetch("/logout", { method: "POST" });
        window.location.href = "/admin";
      }

    } catch (error) {
      mensaje.innerText = "Error al actualizar credenciales";
      console.error(error);
    }
  });

  btnLogout.addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/admin";
  });
});