// ============================================================
//  State
// ============================================================
let tasks = JSON.parse(localStorage.getItem('tasks-v2') || '[]');
let nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

let currentView   = 'calendar';
let calYear       = new Date().getFullYear();
let calMonth      = new Date().getMonth(); // 0-based
let listFilter    = 'all';
let selectedColor = '#4f46e5';
let editingId     = null;   // null = adding, number = editing
let detailId      = null;

// ============================================================
//  Persistence
// ============================================================
function save() {
  localStorage.setItem('tasks-v2', JSON.stringify(tasks));
}

// ============================================================
//  View switching
// ============================================================
function setView(v) {
  currentView = v;
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.view-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.getElementById('btn-' + v).classList.add('active');
  if (v === 'calendar') renderCalendar();
  if (v === 'list')     renderList();
}

// ============================================================
//  Modal – Add / Edit
// ============================================================
function openAddModal(prefillDate) {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Task';
  document.getElementById('modal-submit').textContent = 'Add Task';
  document.getElementById('task-form').reset();
  selectedColor = '#4f46e5';
  syncSwatches();

  if (prefillDate) {
    document.getElementById('task-date').value = prefillDate;
  } else {
    // default to today
    document.getElementById('task-date').value = todayStr();
  }
  document.getElementById('task-time').value = '09:00';

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('task-title').focus();
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('modal-submit').textContent = 'Save Changes';
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-date').value = task.date;
  document.getElementById('task-time').value = task.time;
  document.getElementById('task-desc').value = task.desc || '';
  selectedColor = task.color || '#4f46e5';
  syncSwatches();
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('task-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

function saveTask(e) {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const date  = document.getElementById('task-date').value;
  const time  = document.getElementById('task-time').value;
  const desc  = document.getElementById('task-desc').value.trim();

  if (!title || !date || !time) return;

  if (editingId !== null) {
    const task = tasks.find(t => t.id === editingId);
    if (task) {
      task.title = title;
      task.date  = date;
      task.time  = time;
      task.desc  = desc;
      task.color = selectedColor;
    }
  } else {
    tasks.push({ id: nextId++, title, date, time, desc, color: selectedColor, done: false });
  }

  save();
  closeModal();
  if (currentView === 'calendar') renderCalendar();
  if (currentView === 'list')     renderList();
}

// Color swatches
document.getElementById('color-picker').addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch');
  if (!swatch) return;
  selectedColor = swatch.dataset.color;
  syncSwatches();
});

function syncSwatches() {
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === selectedColor);
  });
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ============================================================
//  Detail Modal
// ============================================================
function openDetail(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  detailId = id;

  document.getElementById('detail-title').textContent = task.title;

  const doneBtn = document.querySelector('#detail-overlay .btn-primary');
  doneBtn.textContent = task.done ? 'Mark Incomplete' : 'Mark Complete';

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-row">
      <span class="detail-icon">&#128197;</span>
      <div>
        <div class="detail-label">Date &amp; Time</div>
        <div>${formatDateLong(task.date)} at ${formatTime(task.time)}</div>
      </div>
    </div>
    ${task.desc ? `
    <div class="detail-row">
      <span class="detail-icon">&#128221;</span>
      <div>
        <div class="detail-label">Notes</div>
        <div class="detail-desc">${escapeHtml(task.desc)}</div>
      </div>
    </div>` : ''}
    <div class="detail-row">
      <span class="detail-icon">&#9679;</span>
      <div>
        <div class="detail-label">Status</div>
        <div>${task.done ? '&#10003; Completed' : 'Pending'}</div>
      </div>
    </div>
  `;

  document.getElementById('detail-overlay').classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
  detailId = null;
}

function deleteTaskFromDetail() {
  if (detailId === null) return;
  tasks = tasks.filter(t => t.id !== detailId);
  save();
  closeDetail();
  if (currentView === 'calendar') renderCalendar();
  if (currentView === 'list')     renderList();
}

function editTaskFromDetail() {
  const id = detailId;
  closeDetail();
  openEditModal(id);
}

function toggleDoneFromDetail() {
  if (detailId === null) return;
  const task = tasks.find(t => t.id === detailId);
  if (task) task.done = !task.done;
  save();
  closeDetail();
  if (currentView === 'calendar') renderCalendar();
  if (currentView === 'list')     renderList();
}

document.getElementById('detail-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('detail-overlay')) closeDetail();
});

// ============================================================
//  Calendar
// ============================================================
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function goToToday() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  document.getElementById('calendar-heading').textContent =
    `${MONTHS[calMonth]} ${calYear}`;

  const grid = document.getElementById('calendar-grid');

  // Remove old day cells (keep the 7 header cells)
  const headers = Array.from(grid.querySelectorAll('.cal-day-header'));
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h));

  const today = todayStr();
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev  = new Date(calYear, calMonth, 0).getDate();

  // Leading cells from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const dateStr = formatDateStr(calYear, calMonth - 1, d);
    grid.appendChild(makeCalCell(d, dateStr, true));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(calYear, calMonth, d);
    const cell = makeCalCell(d, dateStr, false);
    if (dateStr === today) cell.classList.add('today');
    grid.appendChild(cell);
  }

  // Trailing cells
  const totalCells = firstDay + daysInMonth;
  const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= trailing; d++) {
    const dateStr = formatDateStr(calYear, calMonth + 1, d);
    grid.appendChild(makeCalCell(d, dateStr, true));
  }
}

function makeCalCell(dayNum, dateStr, otherMonth) {
  const cell = document.createElement('div');
  cell.className = 'cal-day' + (otherMonth ? ' other-month' : '');
  cell.innerHTML = `<div class="day-number">${dayNum}</div>`;

  // Click on empty space → open add modal prefilled with this date
  cell.addEventListener('click', e => {
    if (e.target.closest('.cal-task')) return; // handled separately
    openAddModal(dateStr);
  });

  const dayTasks = tasks
    .filter(t => t.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const MAX_VISIBLE = 3;
  dayTasks.slice(0, MAX_VISIBLE).forEach(task => {
    const span = document.createElement('span');
    span.className = 'cal-task' + (task.done ? ' done' : '');
    span.style.background = task.color || '#4f46e5';
    span.textContent = formatTime(task.time) + ' ' + task.title;
    span.title = task.title;
    span.addEventListener('click', e => { e.stopPropagation(); openDetail(task.id); });
    cell.appendChild(span);
  });

  if (dayTasks.length > MAX_VISIBLE) {
    const more = document.createElement('div');
    more.className = 'cal-more';
    more.textContent = `+${dayTasks.length - MAX_VISIBLE} more`;
    more.addEventListener('click', e => { e.stopPropagation(); openAddModal(dateStr); });
    cell.appendChild(more);
  }

  return cell;
}

// ============================================================
//  List View
// ============================================================
function setListFilter(f, btn) {
  listFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

function renderList() {
  const container = document.getElementById('task-list');
  const sort = document.getElementById('sort-select').value;
  const today = todayStr();

  let filtered = tasks.filter(t => {
    if (listFilter === 'done')     return t.done;
    if (listFilter === 'today')    return t.date === today;
    if (listFilter === 'upcoming') return !t.done && t.date >= today;
    return true; // 'all'
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    // datetime: sort by date+time
    return (a.date + a.time).localeCompare(b.date + b.time);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#128197;</div>
        <p>${listFilter === 'done' ? 'No completed tasks yet.' :
            listFilter === 'today' ? 'No tasks scheduled for today.' :
            listFilter === 'upcoming' ? 'No upcoming tasks.' :
            'No tasks yet. Click "+ Add Task" to get started.'}</p>
      </div>`;
    return;
  }

  // Group by date when sorting by datetime
  if (sort === 'datetime') {
    const groups = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    let html = '';
    Object.keys(groups).sort().forEach(date => {
      html += `<div class="date-group-heading">${formatDateLong(date)}</div>`;
      groups[date].forEach(t => { html += taskCardHTML(t); });
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = filtered.map(taskCardHTML).join('');
  }
}

function taskCardHTML(task) {
  return `
    <div class="task-card ${task.done ? 'done' : ''}" onclick="openDetail(${task.id})">
      <div class="task-color-bar" style="background:${task.color || '#4f46e5'}"></div>
      <div class="task-check" onclick="event.stopPropagation()">
        <input type="checkbox" ${task.done ? 'checked' : ''}
          onchange="toggleDone(${task.id})">
      </div>
      <div class="task-body">
        <div class="task-title-row">
          <span class="task-card-title">${escapeHtml(task.title)}</span>
          <span class="task-datetime">${formatDateLong(task.date)} &middot; ${formatTime(task.time)}</span>
        </div>
        ${task.desc ? `<div class="task-desc-preview">${escapeHtml(task.desc)}</div>` : ''}
      </div>
      <div class="task-card-actions" onclick="event.stopPropagation()">
        <button class="icon-btn" title="Edit" onclick="openEditModal(${task.id})">&#9998;</button>
        <button class="icon-btn" title="Delete" onclick="deleteTask(${task.id})">&#x2715;</button>
      </div>
    </div>`;
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  if (currentView === 'calendar') renderCalendar();
  if (currentView === 'list')     renderList();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  if (currentView === 'calendar') renderCalendar();
  if (currentView === 'list')     renderList();
}

// ============================================================
//  Helpers
// ============================================================
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// formatDateStr handles month overflow/underflow for cal cells
function formatDateStr(year, month, day) {
  const d = new Date(year, month, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
//  Init
// ============================================================
renderCalendar();
