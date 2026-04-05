document.addEventListener("DOMContentLoaded", async () => {
  // Auth check
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

  const tabla = document.getElementById("tabla-turnos");
  const mensaje = document.getElementById("mensaje-dashboard");
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    height: "auto",
    contentHeight: 650,
    fixedWeekCount: false,
    allDaySlot: false,
    slotMinTime: "08:00:00",
    slotMaxTime: "19:00:00",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek"
    },
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana"
    },
    events: [],
    eventClick: function (info) {
      abrirModal(info.event);
    }
  });

  calendar.render();

  function formatearFecha(fecha) {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  function abrirModal(evento) {
    document.getElementById("modal-nombre").innerText = evento.extendedProps.nombre;
    document.getElementById("modal-apellido").innerText = evento.extendedProps.apellido;
    document.getElementById("modal-dia").innerText = formatearFecha(evento.extendedProps.dia);
    document.getElementById("modal-hora").innerText = evento.extendedProps.hora;
    document.getElementById("modal-contacto").innerText = evento.extendedProps.contacto;
    document.getElementById("modal-email").innerText = evento.extendedProps.email;
    document.getElementById("modal-turno").classList.remove("oculto");
  }

  function cerrarModal() {
    document.getElementById("modal-turno").classList.add("oculto");
  }

  document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);
  document.getElementById("modal-turno").addEventListener("click", (e) => {
    if (e.target.id === "modal-turno") cerrarModal();
  });

  async function cargarTurnos() {
    try {
      const res = await fetch("/turnos");
      const data = await res.json();

      tabla.innerHTML = "";
      calendar.removeAllEvents();

      if (data.length === 0) {
        mensaje.innerText = "No hay turnos cargados";
        return;
      }

      mensaje.innerText = "";

      data.forEach(t => {
        tabla.innerHTML += `
          <tr>
            <td>${t.nombre}</td>
            <td>${t.apellido}</td>
            <td>${formatearFecha(t.dia)}</td>
            <td>${t.hora}</td>
            <td>${t.contacto}</td>
            <td>${t.email}</td>
            <td>
              <button onclick="cancelarTurno('${t.dia}', '${t.hora}')">CANCELAR</button>
            </td>
          </tr>
        `;

        calendar.addEvent({
          title: `${t.hora} - ${t.nombre} ${t.apellido}`,
          start: `${t.dia}T${t.hora}`,
          extendedProps: {
            nombre: t.nombre,
            apellido: t.apellido,
            dia: t.dia,
            hora: t.hora,
            contacto: t.contacto,
            email: t.email
          }
        });
      });

    } catch (error) {
      mensaje.innerText = "Error al cargar los turnos";
      console.error(error);
    }
  }

  // Logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await fetch("/logout", { method: "POST" });
      window.location.href = "/admin";
    });
  }

  cargarTurnos();
});

async function cancelarTurno(dia, hora) {
  const confirmar = confirm("¿Seguro que querés cancelar este turno?");
  if (!confirmar) return;

  try {
    const res = await fetch("/turno", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dia, hora })
    });

    const json = await res.json();
    alert(json.mensaje || json.error);
    location.reload();
  } catch (error) {
    console.error(error);
    alert("Error al cancelar el turno");
  }
}