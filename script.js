// --- LOGIN Y REGISTRO ---
window.onload = function() { // Cuando la página termina de cargar...
  const usuarioActivo = localStorage.getItem('usuarioActivo'); // Busca si hay un usuario logueado guardado
  if (usuarioActivo) { // Si existe un usuario activo...
    mostrarLinks(); // Muestra la sección del to-do list
    cargarTareas(usuarioActivo); // Carga sus tareas guardadas
  }
};

function registrar() { // Función que registra nuevos usuarios
  const usuario = document.getElementById('usuario').value.trim(); // Toma el nombre ingresado
  const password = document.getElementById('password').value.trim(); // Toma la contraseña ingresada

  if (!usuario || !password) { // Si falta alguno...
    return (document.getElementById('mensaje').innerText = "Completa todos los campos."); // Muestra aviso
  }

  if (localStorage.getItem(usuario)) { // Si el usuario ya existe en localStorage...
    document.getElementById('mensaje').innerText = "Usuario ya registrado.";
  } else { // Si no existe...
    localStorage.setItem(usuario, password); // Guarda usuario y contraseña
    document.getElementById('mensaje').innerText = "Usuario registrado. Ya puedes iniciar sesión.";
  }
}

function login() { // Función para iniciar sesión
  const usuario = document.getElementById('usuario').value.trim(); // Lee el usuario
  const password = document.getElementById('password').value.trim(); // Lee la contraseña
  const claveGuardada = localStorage.getItem(usuario); // Busca la contraseña guardada

  if (claveGuardada && claveGuardada === password) { // Si coincide...
    localStorage.setItem('usuarioActivo', usuario); // Guarda quién está logueado
    mostrarLinks(); // Muestra la lista
    cargarTareas(usuario); // Carga sus tareas
  } else {
    document.getElementById('mensaje').innerText = "Usuario o contraseña incorrectos."; // Error
  }
}

function mostrarLinks() { // Muestra la parte del to-do list
  document.getElementById('login-register').style.display = 'none'; // Oculta el login
  document.getElementById('links').style.display = 'block'; // Muestra las tareas
  document.getElementById('nombreUsuario').textContent = localStorage.getItem('usuarioActivo'); // Escribe el nombre del usuario
}

function cerrarSesion() { // Cierra sesión
  localStorage.removeItem('usuarioActivo'); // Borra el usuario activo
  document.getElementById('login-register').style.display = 'block'; // Muestra login
  document.getElementById('links').style.display = 'none'; // Oculta lista
  document.getElementById('listaTareas').innerHTML = ''; // Limpia las tareas visibles
}

// --- TO-DO LIST ---
function agregarTarea() { // Agrega una nueva tarea
  const input = document.getElementById('nuevaTarea'); // Obtiene el campo de texto
  const texto = input.value.trim(); // Saca espacios en blanco
  if (texto === '') return; // Si está vacío, no hace nada

  const usuario = localStorage.getItem('usuarioActivo'); // Obtiene el usuario actual
  if (!usuario) return; // Si no hay sesión, no agrega nada

  const lista = document.getElementById('listaTareas'); // Busca la lista <ul>
  const li = document.createElement('li'); // Crea un nuevo elemento <li>

  const checkbox = document.createElement('input'); // Crea un checkbox
  checkbox.type = 'checkbox'; // Lo convierte en casilla de verificación

  const span = document.createElement('span'); // Crea un texto
  span.textContent = texto; // Le pone el texto de la tarea

  const borrar = document.createElement('button'); // Crea un botón de borrar
  borrar.textContent = 'X'; // Le pone una "X"
  borrar.classList.add('delete'); // Le da una clase para estilo

  // Marcar completada
  checkbox.addEventListener('change', () => { // Detecta cuando se marca/desmarca el checkbox
    li.classList.toggle('completed', checkbox.checked); // Si está marcado, agrega la clase 'completed'
    guardarTareas(usuario); // Guarda el cambio
  });

  // Borrar tarea
  borrar.addEventListener('click', () => { // Cuando se hace clic en "X"...
    lista.removeChild(li); // Elimina la tarea
    guardarTareas(usuario); // Guarda la lista actualizada
  });

  li.appendChild(checkbox); // Agrega el checkbox al <li>
  li.appendChild(span); // Agrega el texto al <li>
  li.appendChild(borrar); // Agrega el botón al <li>
  lista.appendChild(li); // Agrega el <li> a la lista <ul>

  guardarTareas(usuario); // Guarda las tareas en memoria
  input.value = ''; // Limpia el campo de texto
}

// Guardar tareas en localStorage por usuario
function guardarTareas(usuario) {
  const tareas = []; // Crea un array vacío
  document.querySelectorAll('#listaTareas li').forEach(li => { // Recorre todas las tareas visibles
    tareas.push({
      texto: li.querySelector('span').textContent, // Guarda el texto
      completada: li.classList.contains('completed') // Guarda si está completada o no
    });
  });
  localStorage.setItem('tareas_' + usuario, JSON.stringify(tareas)); // Guarda todo como texto JSON
}

// Cargar tareas del usuario activo
function cargarTareas(usuario) {
  const lista = document.getElementById('listaTareas'); // Selecciona la lista <ul>
  lista.innerHTML = ''; // Limpia la lista actual
  const tareasGuardadas = JSON.parse(localStorage.getItem('tareas_' + usuario) || '[]'); // Carga las tareas guardadas o un array vacío

  tareasGuardadas.forEach(t => { // Recorre cada tarea guardada
    const li = document.createElement('li'); // Crea un nuevo <li>
    const checkbox = document.createElement('input'); // Crea un checkbox
    checkbox.type = 'checkbox';
    checkbox.checked = t.completada; // Marca si estaba completada

    const span = document.createElement('span');
    span.textContent = t.texto; // Muestra el texto guardado

    const borrar = document.createElement('button');
    borrar.textContent = 'X';
    borrar.classList.add('delete');

    if (t.completada) li.classList.add('completed'); // Si estaba completada, agrega la clase

    checkbox.addEventListener('change', () => { // Permite volver a marcar/desmarcar
      li.classList.toggle('completed', checkbox.checked);
      guardarTareas(usuario);
    });

    borrar.addEventListener('click', () => { // Permite eliminar la tarea
      lista.removeChild(li);
      guardarTareas(usuario);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(borrar);
    lista.appendChild(li); // Agrega el <li> a la lista
  });
}

// Permitir agregar tarea con Enter
document.getElementById('nuevaTarea').addEventListener('keypress', e => {
  if (e.key === 'Enter') agregarTarea(); // Si presionás Enter, agrega la tarea
});
