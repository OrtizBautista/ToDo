// ======================
// POLENTA TO-DO LIST JS + FIREBASE
// ======================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCvDP4pbqwmZyRs05LK6FphTllrMgSGUXg",
  authDomain: "to-do-c3c62.firebaseapp.com",
  projectId: "to-do-c3c62",
  storageBucket: "to-do-c3c62.firebasestorage.app",
  messagingSenderId: "54932016187",
  appId: "1:54932016187:web:37a25819662776954f201e",
  measurementId: "G-Q8721DX0TX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ======================
// FUNCIONES PRINCIPALES
// ======================
document.addEventListener('DOMContentLoaded', () => {

  const mensaje = document.getElementById('mensaje');

  // --- FRASES MOTIVACIÓN ---
  const frases = [
    "💪 ¡Podés con todo hoy!",
    "🔥 No dejes que nada te detenga.",
    "🧠 Un paso más, un logro más.",
    "🌟 Lo estás haciendo genial."
  ];
  mensaje.innerText = frases[Math.floor(Math.random() * frases.length)];

  // --- LOGIN CON GOOGLE ---
  document.getElementById('loginGoogle').addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('usuarioActivo', user.uid);
      mostrarTodo(user.displayName);
      await cargarTareasFirebase(user.uid);
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión con Google");
    }
  });

  // --- LOGIN AUTOMÁTICO ---
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  if (usuarioActivo) {
    mostrarTodo("Usuario");
    cargarTareasFirebase(usuarioActivo);
  }

  // --- CERRAR SESIÓN ---
  window.cerrarSesion = async () => {
    await signOut(auth);
    localStorage.removeItem('usuarioActivo');
    document.getElementById('login-register').style.display = 'block';
    document.getElementById('todo-list').style.display = 'none';
    document.getElementById('listaTareas').innerHTML = '';
  };

  // --- MOSTRAR TO-DO LIST ---
  function mostrarTodo(nombre) {
    document.getElementById('login-register').style.display = 'none';
    document.getElementById('todo-list').style.display = 'block';
    document.getElementById('nombreUsuario').textContent = nombre;
  }

  // --- FUNCIONES DE TAREAS ---
  const inputTarea = document.getElementById('nuevaTarea');

  window.agregarTarea = async () => {
    const texto = inputTarea.value.trim();
    const usuario = localStorage.getItem('usuarioActivo');
    if (!usuario) { alert("Debés iniciar sesión para agregar tareas."); return; }
    if (texto === '') return;

    const li = document.createElement('li');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
    const span = document.createElement('span'); span.textContent = texto;
    const borrar = document.createElement('button'); borrar.textContent = 'X'; borrar.classList.add('delete');

    checkbox.addEventListener('change', () => { li.classList.toggle('completed', checkbox.checked); guardarTareasFirebase(usuario); actualizarContador(); });
    borrar.addEventListener('click', () => { li.remove(); guardarTareasFirebase(usuario); actualizarContador(); });
    activarEdicion(span, usuario);

    li.appendChild(checkbox); li.appendChild(span); li.appendChild(borrar);
    document.getElementById('listaTareas').appendChild(li);

    inputTarea.value = '';
    await guardarTareasFirebase(usuario);
    actualizarContador();
  };

  inputTarea.addEventListener('keypress', e => { if (e.key === 'Enter') agregarTarea(); });

  window.borrarTodo = async () => {
    if (confirm("¿Seguro que querés eliminar todas las tareas?")) {
      document.getElementById('listaTareas').innerHTML = '';
      await guardarTareasFirebase(localStorage.getItem('usuarioActivo'));
      actualizarContador();
    }
  };

  // --- FUNCIONES AUXILIARES ---
  function actualizarContador() {
    const total = document.querySelectorAll('#listaTareas li').length;
    const completadas = document.querySelectorAll('#listaTareas li.completed').length;
    document.getElementById('contadorTareas').textContent = `Pendientes: ${total - completadas} / Total: ${total}`;
  }

  function activarEdicion(span, usuario) {
    span.addEventListener('dblclick', async () => {
      const nuevoTexto = prompt("Editar tarea:", span.textContent);
      if (nuevoTexto) {
        span.textContent = nuevoTexto.trim();
        await guardarTareasFirebase(usuario);
      }
    });
  }

  async function guardarTareasFirebase(usuario) {
    const tareas = [];
    document.querySelectorAll('#listaTareas li').forEach(li => {
      tareas.push({
        texto: li.querySelector('span').textContent,
        completada: li.classList.contains('completed')
      });
    });
    await setDoc(doc(db, "tareas", usuario), { tareas });
  }

  async function cargarTareasFirebase(usuario) {
    const docRef = doc(db, "tareas", usuario);
    const docSnap = await getDoc(docRef);

    const lista = document.getElementById('listaTareas');
    lista.innerHTML = '';

    if (docSnap.exists()) {
      const tareasGuardadas = docSnap.data().tareas || [];
      tareasGuardadas.forEach(t => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = t.completada;
        const span = document.createElement('span'); span.textContent = t.texto;
        const borrar = document.createElement('button'); borrar.textContent = 'X'; borrar.classList.add('delete');

        if (t.completada) li.classList.add('completed');

        checkbox.addEventListener('change', () => { li.classList.toggle('completed', checkbox.checked); guardarTareasFirebase(usuario); actualizarContador(); });
        borrar.addEventListener('click', () => { li.remove(); guardarTareasFirebase(usuario); actualizarContador(); });
        activarEdicion(span, usuario);

        li.appendChild(checkbox); li.appendChild(span); li.appendChild(borrar);
        lista.appendChild(li);
      });
    }
    actualizarContador();
  }

});
