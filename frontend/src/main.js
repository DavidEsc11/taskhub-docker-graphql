import './style.css';
import { registrar, login, listarTareas, crearTarea, alternarTarea, eliminarTarea } from './api.js';

const app = document.getElementById('app');

// Escapa texto del usuario antes de ponerlo en el HTML (evita inyección de código).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Pantalla de acceso (login / registro) ----------
function pantallaAcceso(modo = 'login', mensaje = '') {
  const esRegistro = modo === 'registro';
  app.innerHTML = `
    <section class="tarjeta">
      <h1>TaskHub</h1>
      <p class="sub">${esRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}</p>
      <form id="form-acceso">
        ${esRegistro ? '<input name="nombre" placeholder="Nombre" required />' : ''}
        <input name="email" type="email" placeholder="Correo" required />
        <input name="password" type="password" placeholder="Contraseña (mín. 6)" required />
        <button type="submit">${esRegistro ? 'Registrarme' : 'Entrar'}</button>
      </form>
      <p class="error">${esc(mensaje)}</p>
      <button class="link" id="cambiar">${esRegistro ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
    </section>`;

  document.getElementById('cambiar').onclick = () => pantallaAcceso(esRegistro ? 'login' : 'registro');
  document.getElementById('form-acceso').onsubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      const r = esRegistro ? await registrar(f.nombre, f.email, f.password) : await login(f.email, f.password);
      localStorage.setItem('token', r.token);
      localStorage.setItem('nombre', r.usuario.nombre);
      pantallaTareas();
    } catch (err) {
      pantallaAcceso(modo, err.message);
    }
  };
}

// ---------- Pantalla principal: lista de tareas ----------
async function pantallaTareas() {
  let tareas = [];
  try {
    tareas = await listarTareas();
  } catch {
    // Token vencido o inválido: volvemos al acceso.
    localStorage.clear();
    return pantallaAcceso('login', 'Tu sesión expiró');
  }

  app.innerHTML = `
    <section class="tarjeta">
      <header>
        <h1>Hola, ${esc(localStorage.getItem('nombre'))}</h1>
        <button class="link" id="salir">Salir</button>
      </header>
      <form id="form-tarea">
        <input name="titulo" placeholder="Nueva tarea" required />
        <input name="descripcion" placeholder="Descripción (opcional)" />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        ${tareas.length === 0 ? '<li class="vacio">Aún no tienes tareas</li>' : ''}
        ${tareas
          .map(
            (t) => `<li class="${t.completada ? 'hecha' : ''}">
              <label><input type="checkbox" data-id="${t.id}" ${t.completada ? 'checked' : ''} />
              <span><b>${esc(t.titulo)}</b><small>${esc(t.descripcion)}</small></span></label>
              <button class="borrar" data-borrar="${t.id}" title="Eliminar">✕</button>
            </li>`
          )
          .join('')}
      </ul>
    </section>`;

  document.getElementById('salir').onclick = () => {
    localStorage.clear();
    pantallaAcceso('login');
  };
  document.getElementById('form-tarea').onsubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    await crearTarea(f.titulo, f.descripcion);
    pantallaTareas();
  };
  app.querySelectorAll('input[type=checkbox]').forEach((c) => {
    c.onchange = async () => { await alternarTarea(c.dataset.id); pantallaTareas(); };
  });
  app.querySelectorAll('[data-borrar]').forEach((b) => {
    b.onclick = async () => { await eliminarTarea(b.dataset.borrar); pantallaTareas(); };
  });
}

// Arranque: si ya hay token guardado, vamos directo a las tareas.
localStorage.getItem('token') ? pantallaTareas() : pantallaAcceso('login');
