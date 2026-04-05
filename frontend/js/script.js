document.addEventListener("DOMContentLoaded", () => {

  const select = document.getElementById("hora");
  const inputDia = document.getElementById("dia");

  // Generar TODOS los horarios posibles
    function generarHorariosBase() {
    let horarios = [];

    for (let h = 8; h <= 18; h++) {
        for (let m of ["00", "30"]) {
        let hora = `${String(h).padStart(2, '0')}:${m}`;
        horarios.push(hora);
        }
    }

    return horarios;
    }

    function convertirFecha(fecha) {
    const [dia, mes, anio] = fecha.split("/");
    return `${anio}-${mes}-${dia}`;
    }

    async function cargarHorarios() {
    const diaInput = inputDia.value;

    if (!diaInput) return;

    // 🔥 ACÁ VA
    const diaFormateado = convertirFecha(diaInput);

    const res = await fetch(`/turnos/${diaFormateado}`);
    const ocupados = await res.json();

    const ocupadosHoras = ocupados.map(t => t.hora);

    // limpiar select
    select.innerHTML = '<option value="">Seleccionar horario</option>';

    const todos = generarHorariosBase();

    let index = 0;

    for (let hora of todos) {

        if (ocupadosHoras.includes(hora)) continue;

        let option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;

        option.style.backgroundColor =
        index % 2 === 0 ? "#1f1f1f" : "#2b2b2b";
        option.style.color = "#fff";

        select.appendChild(option);
        index++;
    }
    }

    // evento cuando cambia la fecha
    inputDia.addEventListener("change", cargarHorarios);


    // ENVÍO DEL FORMULARIO
    document.getElementById("formulario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        dia: convertirFecha(document.getElementById("dia").value),
        hora: document.getElementById("hora").value,
        contacto: document.getElementById("contacto").value,
        email: document.getElementById("email").value
    };

    const res = await fetch("/turno", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const json = await res.json();

        document.getElementById("mensaje").innerText =
        json.mensaje || json.error;

        // limpiar formulario SOLO si fue exitoso
        if (json.mensaje) {
        document.getElementById("formulario").reset();
        document.getElementById("hora").innerHTML = '<option value="">Seleccionar horario</option>';
        }
        //borrar mensaje después de 3 segundos
        setTimeout(() => {
        document.getElementById("mensaje").innerText = "";
        }, 3000);
    //refrescar horarios después de reservar
    cargarHorarios();
    });

    flatpickr("#dia", {
        dateFormat: "d/m/Y",
        minDate: "today",
        locale: "es",
        disableMobile: true,
        firstDayOfWeek: 1
    });
});