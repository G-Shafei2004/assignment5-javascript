(function () {
'use strict';

/* ===== Task 2: Kanban board built from an array of objects ===== */

const WIP_LIMIT = 3; // max cards in "In progress"
const COLUMNS = ['todo', 'progress', 'done'];
const COLUMN_NAMES = { todo: 'To do', progress: 'In progress', done: 'Done' };
const PRIORITY_NAMES = { 1: 'High', 2: 'Medium', 3: 'Low' };

// id (number), title (string), tag (string), priority (number), hours (number),
// column (string), urgent (boolean), members (array)
const tasks = [
  { id: 1,  title: 'Design the Food House logo',      tag: 'design',  priority: 2, hours: 3, column: 'done', urgent: false, members: ['Ali'] },
  { id: 2,  title: 'Build the home page layout',      tag: 'code',    priority: 1, hours: 5, column: 'done', urgent: false, members: ['Ali', 'Sara'] },
  { id: 3,  title: 'Write menu descriptions',         tag: 'content', priority: 3, hours: 2, column: 'progress', urgent: false, members: ['Sara'] },
  { id: 4,  title: 'Make the menu page responsive',   tag: 'code',    priority: 1, hours: 4, column: 'progress', urgent: true, members: ['Ali'] },
  { id: 5,  title: 'Choose the colour palette',       tag: 'design',  priority: 2, hours: 1, column: 'done', urgent: false, members: ['Sara'] },
  { id: 6,  title: 'Add the contact form',            tag: 'code',    priority: 2, hours: 3, column: 'todo', urgent: false, members: ['Ali'] },
  { id: 7,  title: 'Test on a 375px screen',          tag: 'test',    priority: 1, hours: 2, column: 'todo', urgent: true, members: ['Sara'] },
  { id: 8,  title: 'Take photos of the dishes',       tag: 'content', priority: 3, hours: 4, column: 'todo', urgent: false, members: ['Sara'] },
  { id: 9,  title: 'Check keyboard navigation',       tag: 'test',    priority: 2, hours: 2, column: 'todo', urgent: false, members: ['Ali'] },
  { id: 10, title: 'Publish on GitHub Pages',         tag: 'code',    priority: 1, hours: 1, column: 'todo', urgent: true, members: ['Ali', 'Sara'] },
  { id: 11, title: 'Draw the opening-hours icon set', tag: 'design',  priority: 3, hours: 3, column: 'todo', urgent: false, members: ['Sara'] },
  { id: 12, title: 'Proofread all pages',             tag: 'content', priority: 2, hours: 2, column: 'todo', urgent: false, members: ['Ali'] }
];

// ---- DOM (HTML has only empty containers) ----
const board = document.getElementById('k-board');
const bodies = {
  todo: document.getElementById('k-todo'),
  progress: document.getElementById('k-progress-col'),
  done: document.getElementById('k-done')
};
const counters = {
  todo: document.getElementById('k-count-todo'),
  progress: document.getElementById('k-count-progress'),
  done: document.getElementById('k-count-done')
};
const tagSelect = document.getElementById('k-tag');
const searchInput = document.getElementById('k-search');
const sortCheckbox = document.getElementById('k-sort');
const progressBar = document.getElementById('k-progress');
const progressText = document.getElementById('k-progress-text');
const messageEl = document.getElementById('k-message');

// ---- UI state ----
let filterTag = 'all';
let searchText = '';
let sortByPriority = false;

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.remove('is-success', 'is-error', 'is-warning');
  if (type) messageEl.classList.add('is-' + type);
}

function countInColumn(column) {
  let count = 0;
  for (const task of tasks) {
    if (task.column === column) count += 1;
  }
  return count;
}

// ---- my own loop: finished cards and finished hours ----
function calculateProgress() {
  let doneCount = 0;
  let doneHours = 0;
  let totalHours = 0;
  for (const task of tasks) {
    totalHours += task.hours;
    if (task.column === 'done') {
      doneCount += 1;
      doneHours += task.hours;
    }
  }
  return { doneCount, doneHours, totalHours };
}

function getVisibleTasks() {
  const query = searchText.trim().toLowerCase();
  const visible = tasks.filter((task) => {
    const tagOk = filterTag === 'all' || task.tag === filterTag;
    const textOk = query === '' || task.title.toLowerCase().includes(query);
    return tagOk && textOk;
  });
  if (sortByPriority) {
    visible.sort((a, b) => a.priority - b.priority || a.id - b.id);
  }
  return visible;
}

function createCard(task) {
  const card = document.createElement('article');
  card.classList.add('card', 'priority-' + task.priority);
  if (task.column === 'done') card.classList.add('is-done');

  const title = document.createElement('h4');
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.classList.add('card-meta');
  const tag = document.createElement('span');
  tag.classList.add('tag');
  tag.textContent = task.tag;
  const priority = document.createElement('span');
  priority.textContent = PRIORITY_NAMES[task.priority] + ' priority';
  const hours = document.createElement('span');
  hours.textContent = task.hours + ' h';
  meta.append(tag, priority, hours);
  if (task.urgent) {
    const urgent = document.createElement('span');
    urgent.classList.add('urgent');
    urgent.textContent = '🔥 Urgent';
    meta.append(urgent);
  }
  const members = document.createElement('span');
  members.textContent = '👤 ' + task.members.join(', ');
  meta.append(members);

  const actions = document.createElement('div');
  actions.classList.add('card-actions');
  const left = document.createElement('button');
  left.type = 'button';
  left.textContent = '← Back';
  left.dataset.action = 'left';
  left.dataset.id = task.id;
  left.disabled = task.column === COLUMNS[0];
  const right = document.createElement('button');
  right.type = 'button';
  right.textContent = 'Next →';
  right.dataset.action = 'right';
  right.dataset.id = task.id;
  right.disabled = task.column === COLUMNS[COLUMNS.length - 1];
  actions.append(left, right);

  card.append(title, meta, actions);
  return card;
}

// ---- the only render function, called after every change ----
function render() {
  const visible = getVisibleTasks();

  for (const column of COLUMNS) {
    bodies[column].replaceChildren();
    const cards = visible.filter((task) => task.column === column);
    for (const task of cards) {
      bodies[column].append(createCard(task));
    }
    if (cards.length === 0) {
      const empty = document.createElement('p');
      empty.classList.add('empty');
      empty.textContent = visible.length === 0 ? 'Nothing found' : 'No cards here';
      bodies[column].append(empty);
    }
    counters[column].textContent = countInColumn(column);
  }

  const progress = calculateProgress();
  progressBar.max = tasks.length;
  progressBar.value = progress.doneCount;
  progressText.textContent =
    progress.doneCount + ' of ' + tasks.length + ' cards finished (' +
    progress.doneHours + ' of ' + progress.totalHours + ' hours)';

  if (visible.length === 0) {
    showMessage('Nothing found. Change the tag or the search text.', 'warning');
  }
}

function moveTask(id, direction) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const targetIndex = COLUMNS.indexOf(task.column) + (direction === 'right' ? 1 : -1);
  if (targetIndex < 0 || targetIndex >= COLUMNS.length) return;
  const target = COLUMNS[targetIndex];

  // rule: the middle column holds at most WIP_LIMIT cards
  if (target === 'progress' && countInColumn('progress') >= WIP_LIMIT) {
    showMessage(
      'Blocked: “In progress” already has ' + WIP_LIMIT + ' cards. Finish one first.',
      'error'
    );
    return; // the data is not changed
  }

  task.column = target; // change the array first...
  showMessage('“' + task.title + '” moved to ' + COLUMN_NAMES[target] + '.', 'success');
  render();             // ...then render
}

// ---- event delegation: ONE listener for the buttons of all cards ----
board.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  moveTask(Number(button.dataset.id), button.dataset.action);
});

// ---- filter / search / sort controls ----
function fillTagSelect() {
  const tags = [];
  for (const task of tasks) {
    if (!tags.includes(task.tag)) tags.push(task.tag);
  }
  for (const tag of tags) {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  }
}

tagSelect.addEventListener('change', () => {
  filterTag = tagSelect.value;
  showMessage('');
  render();
});
searchInput.addEventListener('input', () => {
  searchText = searchInput.value;
  showMessage('');
  render();
});
sortCheckbox.addEventListener('change', () => {
  sortByPriority = sortCheckbox.checked;
  render();
});

fillTagSelect();
render();
})();
