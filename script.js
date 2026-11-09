// Selección de elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// Estado de la aplicación
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    renderTasks();
});

// Agregar Tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        category: taskCategory.value,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    
    taskInput.value = '';
    taskInput.focus();
});

// Manejar clics en la lista (completar o eliminar)
taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = Number(taskItem.dataset.id);

    // Botón de eliminar
    if (e.target.closest('.btn-delete')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveAndRender();
    }
    
    // Checkbox o cambio de estado
    if (e.target.classList.contains('task-checkbox')) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = e.target.checked;
            saveAndRender();
        }
    }
});

// Cambiar de Filtro
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Cambiar Modo Oscuro / Claro
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// Guardar en LocalStorage y actualizar pantalla
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Renderizar tareas en el DOM
function renderTasks() {
    // Filtrar tareas según el botón activo
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Limpiar lista actual
    taskList.innerHTML = '';

    // Mostrar estado vacío si no hay tareas
    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    // Generar elementos HTML para cada tarea
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="badge">${task.category}</span>
            </div>
            <button class="btn-delete" title="Eliminar tarea">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        taskList.appendChild(li);
    });

    // Actualizar contador de tareas pendientes
    const pendingCount = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${pendingCount} ${pendingCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
}

// Función auxiliar para seguridad (evitar inyección de HTML en textos)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}