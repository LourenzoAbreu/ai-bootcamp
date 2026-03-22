/* ═══════════════════════════════════════════════════════════════════════
   BravaPlan — app.js
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════ STATE */
const STATE = {
  view: 'dashboard',
  tasks: [],
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  listMode: 'list',           // 'list' | 'board'
  listStatus: 'all',
  listPriority: '',
  listProject: '',
  listAssignee: '',
  listSort: 'dueDate',
  listSearch: '',
  teamDept: 'all',
  panelOpen: false,
  panelType: null,            // 'task' | 'employee'
  panelData: null,
  editingAssignees: [],
};

const STORAGE_KEY  = 'brava_tasks';
const MEMBERS_KEY  = 'brava_members';

/* ══════════════════════════════════════════════════ STORAGE */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.tasks));
}
function saveMembers() {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(EMPLOYEES));
}

function initData() {
  // Load employees first (must happen before tasks so assignee refs work)
  try {
    const storedMembers = localStorage.getItem(MEMBERS_KEY);
    if (storedMembers) {
      const parsed = JSON.parse(storedMembers);
      EMPLOYEES.length = 0;
      parsed.forEach(e => EMPLOYEES.push(e));
    }
  } catch (e) { /* use defaults */ }

  // Load tasks
  const stored = loadTasks();
  STATE.tasks = stored || JSON.parse(JSON.stringify(SAMPLE_TASKS));
  if (!stored) saveTasks();
}

/* ══════════════════════════════════════════════════ HELPERS */
function getEmployee(id) { return EMPLOYEES.find(e => e.id === id); }
function getProject(id)  { return PROJECTS.find(p => p.id === id); }

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function isOverdue(task) {
  return task.status !== 'done' && task.dueDate && task.dueDate < todayStr();
}
function isDueToday(task) {
  return task.status !== 'done' && task.dueDate === todayStr();
}

function priorityOrder(p) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

function genId() {
  return 't' + Date.now() + Math.random().toString(36).substring(2, 7);
}

function avatarHtml(emp, size = 24, extraStyle = '') {
  const initials = getInitials(emp.name);
  return `<div class="mini-avatar" style="background:${emp.color};width:${size}px;height:${size}px;font-size:${Math.floor(size*0.38)}px;${extraStyle}">${initials}</div>`;
}

function priorityBadgeHtml(priority) {
  const cfg = PRIORITY_CONFIG[priority];
  if (!cfg) return '';
  return `<span class="priority-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`;
}

function statusBadgeHtml(status) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return '';
  return `<span class="status-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`;
}

/* ══════════════════════════════════════════════════ NAVIGATION */
function navigate(view, extraState) {
  STATE.view = view;
  if (extraState) Object.assign(STATE, extraState);

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  // Update page title
  const titles = { dashboard: 'Dashboard', calendar: 'Calendar', list: 'Task List', team: 'Team' };
  document.getElementById('pageTitle').textContent = titles[view] || 'BravaPlan';

  // Show correct view
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById('view-' + view).classList.remove('hidden');

  // Close sidebar on mobile
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }

  renderCurrentView();
}

function renderCurrentView() {
  switch (STATE.view) {
    case 'dashboard': renderDashboard(); break;
    case 'calendar':  renderCalendar();  break;
    case 'list':      renderList();      break;
    case 'team':      renderTeam();      break;
  }
}

/* ══════════════════════════════════════════════════ DASHBOARD */
function renderDashboard() {
  renderStatCards();
  renderProjectProgress();
  renderTeamWorkload();
  renderUpcomingTasks();
}

function renderStatCards() {
  const today = todayStr();
  const active   = STATE.tasks.filter(t => t.status === 'inprogress').length;
  const done     = STATE.tasks.filter(t => t.status === 'done').length;
  const dueToday = STATE.tasks.filter(isDueToday).length;
  const overdue  = STATE.tasks.filter(isOverdue).length;

  document.getElementById('statCards').innerHTML = `
    <div class="stat-card active">
      <div class="stat-label">Active Tasks</div>
      <div class="stat-value">${active}</div>
      <div class="stat-sub">In progress now</div>
    </div>
    <div class="stat-card done">
      <div class="stat-label">Completed</div>
      <div class="stat-value">${done}</div>
      <div class="stat-sub">Tasks finished</div>
    </div>
    <div class="stat-card today">
      <div class="stat-label">Due Today</div>
      <div class="stat-value">${dueToday}</div>
      <div class="stat-sub">Needs attention</div>
    </div>
    <div class="stat-card overdue">
      <div class="stat-label">Overdue</div>
      <div class="stat-value">${overdue}</div>
      <div class="stat-sub">Past due date</div>
    </div>
  `;
}

function renderProjectProgress() {
  const el = document.getElementById('projectProgress');
  const items = PROJECTS.map(proj => {
    const tasks = STATE.tasks.filter(t => t.project === proj.id);
    const done  = tasks.filter(t => t.status === 'done').length;
    const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { proj, tasks: tasks.length, done, pct };
  }).filter(i => i.tasks > 0).sort((a, b) => b.pct - a.pct);

  if (!items.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No project data.</p>'; return; }

  el.innerHTML = items.map(i => `
    <div class="proj-progress-item">
      <div class="proj-progress-top">
        <span class="proj-progress-name" style="color:${i.proj.color}">${i.proj.name}</span>
        <span class="proj-progress-pct">${i.done}/${i.tasks} &bull; ${i.pct}%</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${i.pct}%;background:${i.proj.color}"></div>
      </div>
    </div>
  `).join('');
}

function renderTeamWorkload() {
  const el = document.getElementById('teamWorkload');
  const counts = {};
  STATE.tasks.filter(t => t.status !== 'done').forEach(t => {
    (t.assignees || []).forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = sorted[0]?.[1] || 1;

  if (!sorted.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No active assignments.</p>'; return; }

  el.innerHTML = sorted.map(([id, cnt]) => {
    const emp = getEmployee(id);
    if (!emp) return '';
    return `
      <div class="workload-item">
        <div class="workload-avatar" style="background:${emp.color}">${getInitials(emp.name)}</div>
        <div class="workload-name">${emp.name}</div>
        <div class="workload-bar-wrap">
          <div class="workload-bar" style="width:${Math.round((cnt/max)*100)}%"></div>
        </div>
        <div class="workload-count">${cnt} task${cnt !== 1 ? 's' : ''}</div>
      </div>
    `;
  }).join('');
}

function renderUpcomingTasks() {
  const el = document.getElementById('upcomingTasks');
  const today = todayStr();
  const upcoming = STATE.tasks
    .filter(t => t.status !== 'done' && t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8);

  if (!upcoming.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No upcoming tasks.</p>';
    return;
  }

  el.innerHTML = upcoming.map(t => {
    const proj = getProject(t.project);
    const assigneeAvatars = (t.assignees || []).slice(0, 3).map(id => {
      const emp = getEmployee(id);
      return emp ? avatarHtml(emp) : '';
    }).join('');
    return `
      <div class="upcoming-item" onclick="openTaskPanel('${t.id}')">
        <div class="upcoming-proj-dot" style="background:${proj?.color || '#999'}"></div>
        <div class="upcoming-info">
          <div class="upcoming-title">${t.title}</div>
          <div class="upcoming-meta">${proj?.name || ''} &bull; Due ${formatDateShort(t.dueDate)}</div>
        </div>
        <div class="upcoming-right">
          ${priorityBadgeHtml(t.priority)}
          <div style="display:flex">${assigneeAvatars}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════ CALENDAR */
function renderCalendar() {
  const year  = STATE.calYear;
  const month = STATE.calMonth;
  const today = new Date();
  const todayISO = todayStr();

  // Month label
  document.getElementById('calMonthLabel').textContent =
    new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const grid = document.getElementById('calGrid');

  // Day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let html = dayNames.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  // First day of month + last day
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build task map by date string
  const taskMap = {};
  STATE.tasks.forEach(t => {
    const key = t.dueDate;
    if (!taskMap[key]) taskMap[key] = [];
    taskMap[key].push(t);
  });

  // Previous month filler
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    html += renderCalDay(day, dateStr, true, false);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayISO;
    html += renderCalDay(d, dateStr, false, isToday);
  }

  // Next month filler
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const remaining  = totalCells - firstDay - daysInMonth;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${year}-${String(month+2).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html += renderCalDay(d, dateStr, true, false);
  }

  grid.innerHTML = html;
}

function renderCalDay(day, dateStr, otherMonth, isToday) {
  // Build task map
  const tasks = STATE.tasks.filter(t => t.dueDate === dateStr);
  const shown = tasks.slice(0, 3);
  const extra = tasks.length - 3;

  const chipsHtml = shown.map(t => {
    const proj = getProject(t.project);
    return `<div class="cal-event-chip" style="background:${proj?.color || '#999'}" onclick="openTaskPanel('${t.id}');event.stopPropagation()" title="${t.title}">${t.title}</div>`;
  }).join('');
  const moreHtml = extra > 0 ? `<div class="cal-more" onclick="calMoreClick('${dateStr}');event.stopPropagation()">+${extra} more</div>` : '';

  const todayClass = isToday ? ' today' : '';
  const otherClass = otherMonth ? ' other-month' : '';

  return `
    <div class="cal-day${todayClass}${otherClass}" onclick="calDayClick('${dateStr}')">
      <div class="cal-date">${day}</div>
      <div class="cal-events">
        ${chipsHtml}
        ${moreHtml}
      </div>
    </div>
  `;
}

function calDayClick(dateStr) {
  openModal(null, { date: dateStr, dueDate: dateStr });
}

function calMoreClick(dateStr) {
  // Navigate to list view filtered — show all tasks for that day
  navigate('list', { listProject: '', listStatus: 'all', listPriority: '', listAssignee: '' });
  // Just open list; user sees the tasks via notification
  showToast(`Showing tasks — filter by date: ${formatDateShort(dateStr)}`, 'info');
}

/* ══════════════════════════════════════════════════ LIST VIEW */
function renderList() {
  renderListFilters();
  renderListContent();
}

function renderListFilters() {
  // Project dropdown
  const projSel = document.getElementById('filterProject');
  const currentProj = projSel.value;
  projSel.innerHTML = '<option value="">All Projects</option>' +
    PROJECTS.map(p => `<option value="${p.id}" ${STATE.listProject === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
  if (STATE.listProject) projSel.value = STATE.listProject;

  // Assignee dropdown
  const assSel = document.getElementById('filterAssignee');
  assSel.innerHTML = '<option value="">All Assignees</option>' +
    EMPLOYEES.map(e => `<option value="${e.id}" ${STATE.listAssignee === e.id ? 'selected' : ''}>${e.name}</option>`).join('');
  if (STATE.listAssignee) assSel.value = STATE.listAssignee;

  // Status tabs
  document.querySelectorAll('#statusTabs .tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === STATE.listStatus);
  });

  // Priority & sort
  document.getElementById('filterPriority').value = STATE.listPriority;
  document.getElementById('filterSort').value = STATE.listSort;

  // Toggle buttons
  document.getElementById('btnList').classList.toggle('active', STATE.listMode === 'list');
  document.getElementById('btnBoard').classList.toggle('active', STATE.listMode === 'board');
}

function getFilteredTasks() {
  let tasks = [...STATE.tasks];

  // Status filter
  if (STATE.listStatus !== 'all') tasks = tasks.filter(t => t.status === STATE.listStatus);

  // Priority
  if (STATE.listPriority) tasks = tasks.filter(t => t.priority === STATE.listPriority);

  // Project
  if (STATE.listProject) tasks = tasks.filter(t => t.project === STATE.listProject);

  // Assignee
  if (STATE.listAssignee) tasks = tasks.filter(t => (t.assignees || []).includes(STATE.listAssignee));

  // Search
  if (STATE.listSearch) {
    const q = STATE.listSearch.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.desc || '').toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Sort
  tasks.sort((a, b) => {
    switch (STATE.listSort) {
      case 'dueDate':   return (a.dueDate || '').localeCompare(b.dueDate || '');
      case 'priority':  return priorityOrder(a.priority) - priorityOrder(b.priority);
      case 'title':     return a.title.localeCompare(b.title);
      case 'createdAt': return (b.createdAt || '').localeCompare(a.createdAt || '');
      default:          return 0;
    }
  });

  return tasks;
}

function renderListContent() {
  const tasks = getFilteredTasks();
  const el = document.getElementById('listContent');

  if (STATE.listMode === 'list') {
    renderListMode(tasks, el);
  } else {
    renderBoardMode(tasks, el);
  }
}

function renderListMode(tasks, el) {
  if (!tasks.length) {
    el.innerHTML = `
      <div class="task-list-empty">
        <div class="task-list-empty-icon">📋</div>
        <div class="task-list-empty-text">No tasks found</div>
        <div class="task-list-empty-sub">Try adjusting your filters or create a new task.</div>
      </div>
    `;
    return;
  }

  const rows = tasks.map(t => {
    const proj = getProject(t.project);
    const pcfg = PRIORITY_CONFIG[t.priority] || {};
    const scfg = STATUS_CONFIG[t.status] || {};
    const overdueFlag = isOverdue(t);
    const assigneeAvatars = (t.assignees || []).slice(0, 4).map(id => {
      const emp = getEmployee(id);
      return emp ? avatarHtml(emp) : '';
    }).join('');

    return `
      <div class="task-row" onclick="openTaskPanel('${t.id}')">
        <div>
          <div class="task-row-title">${t.title}</div>
          <div class="task-row-sub">${proj?.name || ''}</div>
        </div>
        <div class="task-row-cell">
          <span class="status-badge" style="background:${scfg.bg};color:${scfg.color}">${scfg.label}</span>
        </div>
        <div class="task-row-cell">
          <span class="priority-badge" style="background:${pcfg.bg};color:${pcfg.color}">${pcfg.label}</span>
        </div>
        <div class="task-row-cell task-row-assignees">${assigneeAvatars}</div>
        <div class="task-row-cell" style="color:${overdueFlag ? '#dc2626' : 'var(--text-muted)'}; font-size:12.5px; font-weight:${overdueFlag?'700':'400'}">
          ${formatDateShort(t.dueDate)}${overdueFlag ? ' ⚠' : ''}
        </div>
        <div class="task-actions" onclick="event.stopPropagation()">
          <button class="action-btn edit" onclick="openModal('${t.id}')">Edit</button>
          <button class="action-btn delete" onclick="deleteTask('${t.id}')">Del</button>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="task-list-table">
      <div class="task-list-header">
        <div class="task-list-header-cell">Task</div>
        <div class="task-list-header-cell">Status</div>
        <div class="task-list-header-cell">Priority</div>
        <div class="task-list-header-cell">Assignees</div>
        <div class="task-list-header-cell">Due Date</div>
        <div class="task-list-header-cell"></div>
      </div>
      ${rows}
    </div>
  `;
}

function renderBoardMode(tasks, el) {
  const statuses = ['todo', 'inprogress', 'inreview', 'done'];
  const cols = statuses.map(status => {
    const cfg = STATUS_CONFIG[status];
    const colTasks = tasks.filter(t => t.status === status);
    const cards = colTasks.map(t => {
      const proj = getProject(t.project);
      const pcfg = PRIORITY_CONFIG[t.priority] || {};
      const overdueFlag = isOverdue(t);
      const assigneeAvatars = (t.assignees || []).slice(0, 4).map(id => {
        const emp = getEmployee(id);
        return emp ? avatarHtml(emp, 22) : '';
      }).join('');

      return `
        <div class="board-card" onclick="openTaskPanel('${t.id}')">
          <div class="board-card-top">
            <span class="board-card-proj" style="background:${proj?.color||'#999'}">${proj?.name?.split(' ')[0] || ''}</span>
            <span class="priority-badge" style="background:${pcfg.bg};color:${pcfg.color};cursor:pointer" onclick="cycleTaskStatus('${t.id}');event.stopPropagation()" title="Click to cycle status">${pcfg.label}</span>
          </div>
          <div class="board-card-title">${t.title}</div>
          <div class="board-card-bottom">
            <span class="board-card-due ${overdueFlag ? 'overdue' : ''}">
              ${overdueFlag ? '⚠ ' : ''}Due ${formatDateShort(t.dueDate)}
            </span>
            <div class="board-card-avatars">${assigneeAvatars}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="board-col">
        <div class="board-col-header">
          <div class="board-col-title" style="color:${cfg.color}">
            ${cfg.label}
            <span class="board-col-count" style="background:${cfg.bg};color:${cfg.color}">${colTasks.length}</span>
          </div>
        </div>
        <div class="board-cards">${cards || '<p style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 0">No tasks</p>'}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `<div class="board-grid">${cols}</div>`;
}

function cycleTaskStatus(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  const idx = STATUS_CYCLE.indexOf(task.status);
  task.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  saveTasks();
  showToast(`Status → ${STATUS_CONFIG[task.status].label}`, 'success');
  renderCurrentView();
  if (STATE.panelOpen && STATE.panelType === 'task' && STATE.panelData?.id === taskId) {
    STATE.panelData = task;
    renderTaskPanel(task);
  }
}

/* ══════════════════════════════════════════════════ TEAM VIEW */
function renderTeam() {
  renderTeamHeader();
  renderDeptFilter();
  renderTeamGrid();
}

function renderTeamHeader() {
  const count = EMPLOYEES.length;
  document.getElementById('teamHeader').innerHTML = `
    <div class="team-view-header">
      <div>
        <h2 class="team-view-title">Team Overview</h2>
        <p class="team-view-count">${count} member${count !== 1 ? 's' : ''}</p>
      </div>
      <button class="btn-primary" onclick="openMemberModal()">+ Add Member</button>
    </div>
  `;
}

function renderDeptFilter() {
  const depts = ['All', ...new Set(EMPLOYEES.map(e => e.dept))].sort();
  const el = document.getElementById('deptFilter');
  el.innerHTML = depts.map(d => {
    const val = d.toLowerCase();
    const active = STATE.teamDept === (d === 'All' ? 'all' : d);
    return `<button class="dept-pill ${active ? 'active' : ''}" onclick="setTeamDept('${d === 'All' ? 'all' : d}')">${d}</button>`;
  }).join('');
}

function setTeamDept(dept) {
  STATE.teamDept = dept;
  renderDeptFilter();
  renderTeamGrid();
}

function renderTeamGrid() {
  const el = document.getElementById('teamGrid');
  const filtered = STATE.teamDept === 'all' ? EMPLOYEES : EMPLOYEES.filter(e => e.dept === STATE.teamDept);

  el.innerHTML = filtered.map(emp => {
    const empTasks = STATE.tasks.filter(t => (t.assignees || []).includes(emp.id));
    const todoCount   = empTasks.filter(t => t.status === 'todo').length;
    const activeCount = empTasks.filter(t => t.status === 'inprogress' || t.status === 'inreview').length;
    const doneCount   = empTasks.filter(t => t.status === 'done').length;
    const total       = empTasks.length;
    const pct         = total ? Math.round((doneCount / total) * 100) : 0;
    const deptClass   = emp.dept.toLowerCase();

    return `
      <div class="team-card" onclick="openEmpPanel('${emp.id}')">
        <button class="team-card-delete" title="Remove member"
          onclick="event.stopPropagation(); deleteMember('${emp.id}')">✕</button>
        <div class="team-avatar" style="background:${emp.color}">${getInitials(emp.name)}</div>
        <div class="team-name">${emp.name}</div>
        <div class="team-role">${emp.role}</div>
        <div class="dept-badge ${deptClass}">${emp.dept}</div>
        <div class="team-task-badges">
          <span class="task-badge todo">${todoCount} todo</span>
          <span class="task-badge active">${activeCount} active</span>
          <span class="task-badge done">${doneCount} done</span>
        </div>
        <div class="team-progress-wrap">
          <div class="team-progress-bar" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════ DETAIL PANEL */
function openTaskPanel(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  STATE.panelOpen = true;
  STATE.panelType = 'task';
  STATE.panelData = task;
  renderTaskPanel(task);
  showPanel();
}

function renderTaskPanel(task) {
  const proj  = getProject(task.project);
  const pcfg  = PRIORITY_CONFIG[task.priority] || {};
  const today = todayStr();

  const statusPills = Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
    const current = key === task.status ? 'current' : '';
    return `<span class="panel-status-pill ${current}" style="background:${cfg.bg};color:${cfg.color}" onclick="setTaskStatus('${task.id}','${key}')">${cfg.label}</span>`;
  }).join('');

  const assigneesHtml = (task.assignees || []).map(id => {
    const emp = getEmployee(id);
    if (!emp) return '';
    return `
      <div class="panel-emp-chip">
        <div class="panel-emp-avatar" style="background:${emp.color}">${getInitials(emp.name)}</div>
        ${emp.name}
      </div>
    `;
  }).join('');

  const tagsHtml = (task.tags || []).map(tag => `<span class="panel-tag">${tag}</span>`).join('');
  const overdueFlag = isOverdue(task);

  document.getElementById('panelBody').innerHTML = `
    <div class="panel-proj-bar">
      <div class="panel-proj-dot" style="background:${proj?.color||'#999'}"></div>
      <span class="panel-proj-name">${proj?.name || 'Unknown Project'}</span>
    </div>
    <div class="panel-title">${task.title}</div>
    <div class="panel-status-row">
      ${statusPills}
      <span class="priority-badge" style="background:${pcfg.bg};color:${pcfg.color}">${pcfg.label}</span>
    </div>
    ${task.desc ? `<div class="panel-desc">${task.desc}</div>` : ''}

    <div class="panel-section">
      <div class="panel-section-label">Assigned To</div>
      <div class="panel-assignees">${assigneesHtml || '<span style="color:var(--text-muted);font-size:13px">Unassigned</span>'}</div>
    </div>

    <div class="panel-section">
      <div class="panel-section-label">Schedule</div>
      <div class="panel-date-row">
        <div class="panel-date-item">
          <div class="panel-section-label">Scheduled</div>
          <div class="panel-date-val">${formatDate(task.date)}${task.time ? ' at ' + task.time : ''}</div>
        </div>
        <div class="panel-date-item">
          <div class="panel-section-label">Due Date</div>
          <div class="panel-date-val" style="color:${overdueFlag ? '#dc2626' : 'inherit'}">${formatDate(task.dueDate)}${overdueFlag ? ' ⚠' : ''}</div>
        </div>
      </div>
    </div>

    ${task.tags?.length ? `
    <div class="panel-section">
      <div class="panel-section-label">Tags</div>
      <div class="panel-tags">${tagsHtml}</div>
    </div>` : ''}

    <div class="panel-section">
      <div class="panel-section-label">Created</div>
      <div style="font-size:13px;color:var(--text-muted)">${formatDate(task.createdAt)}</div>
    </div>

    <div class="panel-actions">
      <button class="btn-panel-edit" onclick="openModal('${task.id}')">Edit Task</button>
      <button class="btn-panel-delete" onclick="deleteTask('${task.id}')">Delete</button>
    </div>
  `;
}

function setTaskStatus(taskId, newStatus) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task || task.status === newStatus) return;
  task.status = newStatus;
  saveTasks();
  showToast(`Status updated to "${STATUS_CONFIG[newStatus].label}"`, 'success');
  renderTaskPanel(task);
  if (STATE.view !== 'dashboard') renderCurrentView();
  else renderDashboard();
}

function openEmpPanel(empId) {
  const emp = getEmployee(empId);
  if (!emp) return;
  STATE.panelOpen = true;
  STATE.panelType = 'employee';
  STATE.panelData = emp;
  renderEmpPanel(emp);
  showPanel();
}

function renderEmpPanel(emp) {
  const empTasks = STATE.tasks.filter(t => (t.assignees || []).includes(emp.id));
  const todoCount   = empTasks.filter(t => t.status === 'todo').length;
  const activeCount = empTasks.filter(t => t.status === 'inprogress' || t.status === 'inreview').length;
  const doneCount   = empTasks.filter(t => t.status === 'done').length;
  const total       = empTasks.length;
  const pct         = total ? Math.round((doneCount / total) * 100) : 0;
  const deptClass   = emp.dept.toLowerCase();

  const taskListHtml = empTasks.slice(0, 10).map(t => {
    const proj = getProject(t.project);
    const scfg = STATUS_CONFIG[t.status] || {};
    const pcfg = PRIORITY_CONFIG[t.priority] || {};
    const overdueFlag = isOverdue(t);
    return `
      <div class="emp-task-item" style="border-color:${proj?.color||'#999'}" onclick="openTaskPanel('${t.id}')">
        <div class="emp-task-title">${t.title}</div>
        <div class="emp-task-meta">
          <span style="background:${scfg.bg};color:${scfg.color};padding:2px 7px;border-radius:999px;font-size:11px;font-weight:600">${scfg.label}</span>
          <span style="background:${pcfg.bg};color:${pcfg.color};padding:2px 7px;border-radius:999px;font-size:11px;font-weight:600">${pcfg.label}</span>
          <span style="color:${overdueFlag?'#dc2626':'var(--text-muted)'}">Due ${formatDateShort(t.dueDate)}</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('panelBody').innerHTML = `
    <div class="emp-panel-header">
      <div class="emp-panel-avatar" style="background:${emp.color}">${getInitials(emp.name)}</div>
      <div class="emp-panel-name">${emp.name}</div>
      <div class="emp-panel-role">${emp.role}</div>
      <div class="dept-badge ${deptClass}">${emp.dept}</div>
      <div class="emp-panel-stats">
        <div class="emp-stat">
          <div class="emp-stat-val" style="color:#475569">${todoCount}</div>
          <div class="emp-stat-label">To Do</div>
        </div>
        <div class="emp-stat">
          <div class="emp-stat-val" style="color:#2563eb">${activeCount}</div>
          <div class="emp-stat-label">Active</div>
        </div>
        <div class="emp-stat">
          <div class="emp-stat-val" style="color:#16a34a">${doneCount}</div>
          <div class="emp-stat-label">Done</div>
        </div>
      </div>
      <div style="width:100%;margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:5px">
          <span>Completion</span><span>${pct}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${pct}%;background:${emp.color}"></div>
        </div>
      </div>
    </div>

    <div class="panel-section-label">Tasks (${total})</div>
    <div class="emp-task-list">${taskListHtml || '<p style="color:var(--text-muted);font-size:13px">No tasks assigned.</p>'}</div>
    ${total > 10 ? `<p style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px">+${total-10} more tasks</p>` : ''}

    <button class="emp-view-tasks-btn" onclick="navigateToEmpTasks('${emp.id}')">View All Tasks →</button>
  `;
}

function navigateToEmpTasks(empId) {
  closePanel();
  navigate('list', { listAssignee: empId, listStatus: 'all', listPriority: '', listProject: '' });
}

function showPanel() {
  document.getElementById('detailPanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('open');
  STATE.panelOpen = true;
}

function closePanel() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('open');
  STATE.panelOpen = false;
  STATE.panelType = null;
  STATE.panelData = null;
}

/* ══════════════════════════════════════════════════ TASK MODAL */
function openModal(editId, prefill) {
  const form = document.getElementById('taskForm');
  form.reset();
  STATE.editingAssignees = [];

  // Populate project dropdown
  document.getElementById('fProject').innerHTML =
    '<option value="">Select project…</option>' +
    PROJECTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  if (editId) {
    const task = STATE.tasks.find(t => t.id === editId);
    if (!task) return;
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('editId').value = task.id;
    document.getElementById('fTitle').value   = task.title;
    document.getElementById('fDesc').value    = task.desc || '';
    document.getElementById('fProject').value = task.project;
    document.getElementById('fPriority').value= task.priority;
    document.getElementById('fStatus').value  = task.status;
    document.getElementById('fDate').value    = task.date;
    document.getElementById('fTime').value    = task.time || '';
    document.getElementById('fDueDate').value = task.dueDate;
    document.getElementById('fTags').value    = (task.tags || []).join(', ');
    STATE.editingAssignees = [...(task.assignees || [])];
  } else {
    document.getElementById('modalTitle').textContent = 'New Task';
    document.getElementById('editId').value = '';
    if (prefill) {
      if (prefill.date)    document.getElementById('fDate').value    = prefill.date;
      if (prefill.dueDate) document.getElementById('fDueDate').value = prefill.dueDate;
      if (prefill.project) document.getElementById('fProject').value = prefill.project;
    }
  }

  renderAssigneeChips();
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('fTitle').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  STATE.editingAssignees = [];
}

function renderAssigneeChips() {
  const el = document.getElementById('assigneeChips');
  el.innerHTML = STATE.editingAssignees.map(id => {
    const emp = getEmployee(id);
    if (!emp) return '';
    return `
      <div class="assignee-chip">
        <div class="assignee-chip-avatar" style="background:${emp.color}">${getInitials(emp.name)}</div>
        ${emp.name}
        <span class="assignee-chip-remove" onclick="removeAssignee('${id}')">&times;</span>
      </div>
    `;
  }).join('');
}

function removeAssignee(id) {
  STATE.editingAssignees = STATE.editingAssignees.filter(a => a !== id);
  renderAssigneeChips();
  renderAssigneeDropdown('');
}

function renderAssigneeDropdown(query) {
  const el = document.getElementById('assigneeDropdown');
  const q  = query.toLowerCase();
  const filtered = EMPLOYEES.filter(emp =>
    (!q || emp.name.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q))
  );
  if (!filtered.length) { el.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-size:13px;text-align:center">No results</div>'; }
  else {
    el.innerHTML = filtered.map(emp => {
      const selected = STATE.editingAssignees.includes(emp.id);
      return `
        <div class="assignee-option ${selected ? 'selected' : ''}" onclick="toggleAssignee('${emp.id}')">
          <div class="panel-emp-avatar" style="background:${emp.color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${getInitials(emp.name)}</div>
          <div>
            <div class="assignee-option-name">${emp.name}${selected ? ' ✓' : ''}</div>
            <div class="assignee-option-role">${emp.role} &bull; ${emp.dept}</div>
          </div>
        </div>
      `;
    }).join('');
  }
  el.classList.add('open');
}

function toggleAssignee(id) {
  if (STATE.editingAssignees.includes(id)) {
    STATE.editingAssignees = STATE.editingAssignees.filter(a => a !== id);
  } else {
    STATE.editingAssignees.push(id);
  }
  renderAssigneeChips();
  renderAssigneeDropdown(document.getElementById('assigneeSearch').value);
}

function saveTask(e) {
  e.preventDefault();
  const id       = document.getElementById('editId').value;
  const title    = document.getElementById('fTitle').value.trim();
  const desc     = document.getElementById('fDesc').value.trim();
  const project  = document.getElementById('fProject').value;
  const priority = document.getElementById('fPriority').value;
  const status   = document.getElementById('fStatus').value;
  const date     = document.getElementById('fDate').value;
  const time     = document.getElementById('fTime').value;
  const dueDate  = document.getElementById('fDueDate').value;
  const tagsRaw  = document.getElementById('fTags').value;
  const tags     = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const assignees = [...STATE.editingAssignees];

  if (!title)   { showToast('Title is required.', 'error'); return; }
  if (!project) { showToast('Project is required.', 'error'); return; }
  if (!date)    { showToast('Scheduled date is required.', 'error'); return; }
  if (!dueDate) { showToast('Due date is required.', 'error'); return; }

  if (id) {
    // Edit existing
    const task = STATE.tasks.find(t => t.id === id);
    if (!task) return;
    Object.assign(task, { title, desc, project, priority, status, date, time, dueDate, tags, assignees });
    saveTasks();
    showToast('Task updated successfully.', 'success');
    if (STATE.panelOpen && STATE.panelType === 'task' && STATE.panelData?.id === id) {
      STATE.panelData = task;
      renderTaskPanel(task);
    }
  } else {
    // New task
    const newTask = { id: genId(), title, desc, project, priority, status, date, time, dueDate, tags, assignees, createdAt: todayStr() };
    STATE.tasks.unshift(newTask);
    saveTasks();
    showToast('Task created successfully.', 'success');
  }

  closeModal();
  renderCurrentView();
}

/* ══════════════════════════════════════════════════ MEMBER MODAL */
const MEMBER_COLORS = [
  '#2563eb','#7c3aed','#0891b2','#059669','#d97706','#9333ea',
  '#0284c7','#16a34a','#dc2626','#db2777','#65a30d','#ea580c',
  '#b91c1c','#0369a1','#6d28d9','#047857','#b45309','#1d4ed8',
  '#be185d','#15803d'
];

let _memberColor = '#2563eb';

function openMemberModal() {
  document.getElementById('memberForm').reset();
  _memberColor = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
  renderMemberColorPresets();
  document.getElementById('memberModalOverlay').classList.add('open');
  document.getElementById('mName').focus();
}

function closeMemberModal() {
  document.getElementById('memberModalOverlay').classList.remove('open');
}

function renderMemberColorPresets() {
  document.getElementById('memberColorPresets').innerHTML = MEMBER_COLORS.map(c => `
    <button type="button" class="color-preset${c === _memberColor ? ' active' : ''}"
      style="background:${c}" onclick="selectMemberColor('${c}')"></button>
  `).join('');
}

function selectMemberColor(color) {
  _memberColor = color;
  renderMemberColorPresets();
}

function saveMemberForm(e) {
  e.preventDefault();
  const name  = document.getElementById('mName').value.trim();
  const role  = document.getElementById('mRole').value.trim();
  const dept  = document.getElementById('mDept').value;
  if (!name || !role || !dept) return;

  const newMember = {
    id:    'e' + Date.now(),
    name,
    role,
    dept,
    color: _memberColor
  };
  EMPLOYEES.push(newMember);
  saveMembers();
  showToast(`${name} added to the team.`, 'success');
  closeMemberModal();
  renderTeam();
}

function deleteMember(empId) {
  const emp = EMPLOYEES.find(e => e.id === empId);
  if (!emp) return;
  const taskCount = STATE.tasks.filter(t => (t.assignees || []).includes(empId)).length;
  const msg = taskCount > 0
    ? `Remove "${emp.name}" from the team?\n\nThey are assigned to ${taskCount} task(s), which will become unassigned.`
    : `Remove "${emp.name}" from the team? This cannot be undone.`;
  if (!confirm(msg)) return;

  // Remove from employee list
  const idx = EMPLOYEES.findIndex(e => e.id === empId);
  if (idx > -1) EMPLOYEES.splice(idx, 1);

  // Unassign from all tasks
  STATE.tasks.forEach(t => {
    t.assignees = (t.assignees || []).filter(id => id !== empId);
  });

  saveMembers();
  saveTasks();
  showToast(`${emp.name} removed from the team.`, 'warning');

  // Close panel if it was showing this employee
  if (STATE.panelOpen && STATE.panelType === 'employee' && STATE.panelData?.id === empId) {
    closePanel();
  }
  renderTeam();
}

/* ══════════════════════════════════════════════════ DELETE */
function deleteTask(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
  STATE.tasks = STATE.tasks.filter(t => t.id !== taskId);
  saveTasks();
  showToast('Task deleted.', 'warning');
  closePanel();
  renderCurrentView();
}

/* ══════════════════════════════════════════════════ SEARCH */
function handleSearch(query) {
  STATE.listSearch = query;
  const q = query.toLowerCase().trim();
  const dropdown = document.getElementById('searchDropdown');

  if (!q) { dropdown.classList.remove('open'); return; }

  const results = STATE.tasks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    (t.desc || '').toLowerCase().includes(q) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(q))
  ).slice(0, 8);

  if (!results.length) {
    dropdown.innerHTML = '<div style="padding:14px;color:var(--text-muted);text-align:center;font-size:13px">No results found</div>';
    dropdown.classList.add('open');
    return;
  }

  dropdown.innerHTML = results.map(t => {
    const proj = getProject(t.project);
    const scfg = STATUS_CONFIG[t.status] || {};
    return `
      <div class="search-result-item" onclick="searchSelectTask('${t.id}')">
        <div style="width:10px;height:10px;border-radius:50%;background:${proj?.color||'#999'};flex-shrink:0"></div>
        <div>
          <div class="search-result-title">${t.title}</div>
          <div class="search-result-meta">${proj?.name||''} &bull; <span style="background:${scfg.bg};color:${scfg.color};padding:1px 6px;border-radius:999px;font-size:11px">${scfg.label}</span></div>
        </div>
      </div>
    `;
  }).join('');
  dropdown.classList.add('open');

  // If we're on list view, re-render with search filter
  if (STATE.view === 'list') renderListContent();
}

function searchSelectTask(taskId) {
  document.getElementById('searchDropdown').classList.remove('open');
  document.getElementById('searchInput').value = '';
  STATE.listSearch = '';
  openTaskPanel(taskId);
}

/* ══════════════════════════════════════════════════ TOAST */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* ══════════════════════════════════════════════════ SIDEBAR PROJECTS */
function renderSidebarProjects() {
  const el = document.getElementById('sidebarProjects');
  el.innerHTML = PROJECTS.map(p => {
    const count = STATE.tasks.filter(t => t.project === p.id && t.status !== 'done').length;
    return `
      <div class="sidebar-project-item" onclick="filterByProject('${p.id}')">
        <div class="project-dot" style="background:${p.color}"></div>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${p.name}</span>
        ${count > 0 ? `<span style="font-size:11px;background:rgba(255,255,255,.12);color:#94a3b8;border-radius:999px;padding:1px 7px;flex-shrink:0">${count}</span>` : ''}
      </div>
    `;
  }).join('');
}

function filterByProject(projectId) {
  // Mark active
  document.querySelectorAll('.sidebar-project-item').forEach(el => el.classList.remove('active'));
  navigate('list', { listProject: projectId, listStatus: 'all', listPriority: '', listAssignee: '' });
}

/* ══════════════════════════════════════════════════ EVENT LISTENERS */
function initEventListeners() {
  // New Task button
  document.getElementById('newTaskBtn').addEventListener('click', () => openModal(null));

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Task form submit
  document.getElementById('taskForm').addEventListener('submit', saveTask);

  // Member modal
  document.getElementById('memberModalClose').addEventListener('click', closeMemberModal);
  document.getElementById('cancelMemberModal').addEventListener('click', closeMemberModal);
  document.getElementById('memberModalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('memberModalOverlay')) closeMemberModal();
  });
  document.getElementById('memberForm').addEventListener('submit', saveMemberForm);

  // Panel close
  document.getElementById('panelClose').addEventListener('click', closePanel);
  document.getElementById('panelOverlay').addEventListener('click', closePanel);

  // Calendar nav
  document.getElementById('calPrev').addEventListener('click', () => {
    STATE.calMonth--;
    if (STATE.calMonth < 0) { STATE.calMonth = 11; STATE.calYear--; }
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    STATE.calMonth++;
    if (STATE.calMonth > 11) { STATE.calMonth = 0; STATE.calYear++; }
    renderCalendar();
  });

  // Status tabs
  document.querySelectorAll('#statusTabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.listStatus = btn.dataset.status;
      renderList();
    });
  });

  // List filters
  document.getElementById('filterPriority').addEventListener('change', e => {
    STATE.listPriority = e.target.value;
    renderListContent();
  });
  document.getElementById('filterProject').addEventListener('change', e => {
    STATE.listProject = e.target.value;
    renderListContent();
  });
  document.getElementById('filterAssignee').addEventListener('change', e => {
    STATE.listAssignee = e.target.value;
    renderListContent();
  });
  document.getElementById('filterSort').addEventListener('change', e => {
    STATE.listSort = e.target.value;
    renderListContent();
  });

  // View toggle (list/board)
  document.getElementById('btnList').addEventListener('click', () => {
    STATE.listMode = 'list';
    document.getElementById('btnList').classList.add('active');
    document.getElementById('btnBoard').classList.remove('active');
    renderListContent();
  });
  document.getElementById('btnBoard').addEventListener('click', () => {
    STATE.listMode = 'board';
    document.getElementById('btnBoard').classList.add('active');
    document.getElementById('btnList').classList.remove('active');
    renderListContent();
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', e => handleSearch(e.target.value));
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.getElementById('searchDropdown').classList.remove('open');
    }, 200);
  });
  searchInput.addEventListener('focus', e => {
    if (e.target.value) handleSearch(e.target.value);
  });

  // Assignee search in modal
  const assigneeSearch = document.getElementById('assigneeSearch');
  assigneeSearch.addEventListener('input', e => renderAssigneeDropdown(e.target.value));
  assigneeSearch.addEventListener('focus', () => renderAssigneeDropdown(assigneeSearch.value));
  assigneeSearch.addEventListener('blur', () => {
    setTimeout(() => document.getElementById('assigneeDropdown').classList.remove('open'), 200);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('memberModalOverlay').classList.contains('open')) {
        closeMemberModal();
      } else if (document.getElementById('modalOverlay').classList.contains('open')) {
        closeModal();
      } else if (STATE.panelOpen) {
        closePanel();
      }
    }
  });

  // Hamburger (mobile)
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });
  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
  });

  // Nav items (handle click on already-active to re-render)
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      // onclick attribute already calls navigate(); don't double-fire
    });
  });
}

/* ══════════════════════════════════════════════════ INIT */
function init() {
  initData();
  initEventListeners();
  renderSidebarProjects();
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
