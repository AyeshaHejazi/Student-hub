// -------------------- DATA (single source of truth) --------------------
let tasks = [];
let runningNotes = [];
let currentPfpUrl = null;

const dayDisplay = {
  today: "📌 Today",
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun"
};

// 🔊 ========== REPLACE WITH YOUR OWN MP3 FILE NAMES ==========
const playlistSongs = [
  { title: "Broklyn Baby",  file: "song1.mp3" },
  { title: "Reminder", file: "song2.mp3" },
  { title: "Doi'n time",   file: "song3.mp3" },
  { title: "Die for you",    file: "song5.mp3" },
  { title: "I like me better",file: "song4.mp3" }
];
// ================================================================

let currentSongIndex = 0, isPlaying = false, repeatMode = false;
const audio = new Audio();

// -------------------- localStorage helpers --------------------
function loadData() {
  const storedTasks = localStorage.getItem("ecru_tasks");
  const storedNotes = localStorage.getItem("ecru_notes");
  const storedPfp = localStorage.getItem("ecru_pfp");
  
  if (storedTasks) tasks = JSON.parse(storedTasks);
  else {
    tasks = [
      { id: Date.now()+1, title: "Read 20 pages", completed: false, day: "today", createdAt: Date.now() },
      { id: Date.now()+2, title: "Water the plants", completed: false, day: "monday", createdAt: Date.now() },
      { id: Date.now()+3, title: "Review weekly goals", completed: false, day: "wednesday", createdAt: Date.now() },
      { id: Date.now()+4, title: "Library of Stars (Gemini)", completed: false, day: "friday", createdAt: Date.now() },
      { id: Date.now()+5, title: "Complete group project", completed: false, day: "saturday", createdAt: Date.now() }
    ];
  }
  
  if (storedNotes) runningNotes = JSON.parse(storedNotes);
  else runningNotes = ["Finish group project", "Skim running notes", "Learn Perfect pitch"];
  
  if (storedPfp) currentPfpUrl = storedPfp;
  updatePfpDisplay();
}

function saveData() {
  localStorage.setItem("ecru_tasks", JSON.stringify(tasks));
  localStorage.setItem("ecru_notes", JSON.stringify(runningNotes));
  if (currentPfpUrl) localStorage.setItem("ecru_pfp", currentPfpUrl);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// -------------------- Task CRUD --------------------
function deleteTaskById(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveData();
  renderAll();
}

function toggleComplete(id, completed) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = completed;
    saveData();
    renderAll();
  }
}

function addNewTask(title, day) {
  if (!title.trim()) return;
  tasks.push({
    id: Date.now(),
    title: title.trim(),
    completed: false,
    day: day,
    createdAt: Date.now()
  });
  saveData();
  renderAll();
}

function addRunningNote(text) {
  if (!text.trim()) return;
  runningNotes.unshift(text.trim());
  saveData();
  renderRunningNotes();
}

// -------------------- Render Functions --------------------
function renderDailyPlanner() {
  const container = document.getElementById("dailyTaskList");
  if (!container) return;
  const todayTasks = tasks.filter(t => t.day === "today");
  if (todayTasks.length === 0) {
    container.innerHTML = `<div style="padding:12px;text-align:center;">✨ no tasks for today</div>`;
    return;
  }
  container.innerHTML = todayTasks.map(task => `
    <div class="task-item" data-id="${task.id}">
      <div class="task-left">
        <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""} data-id="${task.id}">
        <span class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</span>
      </div>
      <button class="delete-task" data-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
    </div>
  `).join('');
  
  document.querySelectorAll('.task-check').forEach(ch => {
    ch.addEventListener('change', (e) => toggleComplete(parseInt(e.target.dataset.id), e.target.checked));
  });
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => deleteTaskById(parseInt(btn.dataset.id)));
  });
}

function renderWeeklyPlan() {
  const grid = document.getElementById("weeklyGrid");
  if (!grid) return;
  const week = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  let html = '';
  for (let day of week) {
    const dayTasks = tasks.filter(t => t.day === day);
    const tasksHtml = dayTasks.map(t => `
      <div class="week-task-item">
        <span class="${t.completed ? 'completed' : ''}">${escapeHtml(t.title)}</span>
        <button class="delete-task-sm" data-id="${t.id}"><i class="fas fa-times-circle"></i></button>
      </div>
    `).join('');
    html += `
      <div class="weekday-col">
        <div class="weekday-name">${dayDisplay[day]}</div>
        <div class="week-tasks">${tasksHtml || '—'}</div>
      </div>
    `;
  }
  grid.innerHTML = html;
  document.querySelectorAll('.delete-task-sm').forEach(btn => {
    btn.addEventListener('click', (e) => deleteTaskById(parseInt(btn.dataset.id)));
  });
}

function renderUpcomingWithTracker() {
  const upcomingContainer = document.getElementById("upcomingList");
  const upcoming = tasks.filter(t => t.day !== "today" && !t.completed).sort((a,b) => a.createdAt - b.createdAt);
  
  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = `<div style="padding:8px;">🎉 all caught up!</div>`;
  } else {
    upcomingContainer.innerHTML = upcoming.map(t => `
      <div class="upcoming-task">
        <div class="upcoming-info">
          <input type="checkbox" class="upcoming-check" data-id="${t.id}" ${t.completed ? "checked" : ""}>
          <span class="upcoming-title ${t.completed ? 'completed-upcoming' : ''}">📅 ${dayDisplay[t.day] || t.day}: ${escapeHtml(t.title)}</span>
        </div>
        <button class="delete-task" data-id="${t.id}" style="background:none;"><i class="fas fa-trash-alt"></i></button>
      </div>
    `).join('');
    
    document.querySelectorAll('.upcoming-check').forEach(ch => {
      ch.addEventListener('change', (e) => toggleComplete(parseInt(e.target.dataset.id), e.target.checked));
    });
    document.querySelectorAll('#upcomingList .delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => deleteTaskById(parseInt(btn.dataset.id)));
    });
  }
  
  // Tracker stats: tasks that are NOT "today"
  const totalNotToday = tasks.filter(t => t.day !== "today").length;
  const completedNotToday = tasks.filter(t => t.day !== "today" && t.completed).length;
  const percent = totalNotToday === 0 ? 0 : Math.round((completedNotToday / totalNotToday) * 100);
  document.getElementById("completionPercent").innerText = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;
}

function renderRunningNotes() {
  const div = document.getElementById("runningNotesList");
  if (!div) return;
  if (runningNotes.length === 0) {
    div.innerHTML = '<div class="note-chip">➕ add note</div>';
    return;
  }
  div.innerHTML = runningNotes.map((note, idx) => `
    <div class="note-chip">
      📝 ${escapeHtml(note)}
      <button class="delete-note" data-index="${idx}"><i class="fas fa-eraser"></i></button>
    </div>
  `).join('');
  document.querySelectorAll('.delete-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index);
      runningNotes.splice(idx, 1);
      saveData();
      renderRunningNotes();
    });
  });
}

function renderCalendar() {
  const container = document.getElementById("calendarWidget");
  if (!container) return;
  const now = new Date();
  let year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let html = `
    <div class="calendar-header">
      <button id="prevMonth"><i class="fas fa-chevron-left"></i></button>
      <span>${now.toLocaleString('default', { month: 'long' })} ${year}</span>
      <button id="nextMonth"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="calendar-weekdays">${['S','M','T','W','T','F','S'].map(d => `<div>${d}</div>`).join('')}</div>
    <div class="calendar-days">
  `;
  
  let dayCount = 1;
  for (let i = 0; i < 42; i++) {
    if (i < firstDay || dayCount > daysInMonth) {
      html += `<div class="cal-day"></div>`;
    } else {
      const todayDate = new Date();
      const isToday = (dayCount === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear());
      const hasTask = tasks.some(t => t.day === "today" && dayCount === todayDate.getDate());
      html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}">${dayCount}</div>`;
      dayCount++;
    }
  }
  html += `</div>`;
  container.innerHTML = html;
  
  document.getElementById("prevMonth")?.addEventListener("click", () => alert("📅 Full month navigation would need extra state, but your tasks are safe!"));
  document.getElementById("nextMonth")?.addEventListener("click", () => alert("📅 Calendar vibe: tasks are shown on current month only."));
}

function renderAll() {
  renderDailyPlanner();
  renderWeeklyPlan();
  renderUpcomingWithTracker();
  renderRunningNotes();
  renderCalendar();
}

// -------------------- Timer --------------------
let timerInterval;
let timeSeconds = 25 * 60;
const timerDisplay = document.getElementById("timerDisplay");

function updateTimerDisplayUI() {
  const mins = Math.floor(timeSeconds / 60);
  const secs = timeSeconds % 60;
  timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.getElementById("startTimerBtn")?.addEventListener("click", () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeSeconds > 0) {
      timeSeconds--;
      updateTimerDisplayUI();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
});
document.getElementById("pauseTimerBtn")?.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
});
document.getElementById("resetTimerBtn")?.addEventListener("click", () => {
  timeSeconds = 25 * 60;
  updateTimerDisplayUI();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
});
updateTimerDisplayUI();

// -------------------- Playlist --------------------
function initPlaylist() {
  const pl = document.getElementById("playlist");
  playlistSongs.forEach((song, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><i class="fas fa-music"></i> ${escapeHtml(song.title)}</span><i class="fas fa-play-circle"></i>`;
    li.addEventListener("click", () => playSong(idx));
    pl.appendChild(li);
  });
  
  document.getElementById("playPauseBtn")?.addEventListener("click", togglePlayPause);
  document.getElementById("volumeSlider")?.addEventListener("input", (e) => audio.volume = parseFloat(e.target.value));
  document.getElementById("repeatBtn")?.addEventListener("click", () => {
    repeatMode = !repeatMode;
    document.getElementById("repeatBtn").style.color = repeatMode ? "#c3aa8b" : "#b59d7f";
  });
  
  audio.volume = 0.7;
  audio.addEventListener("ended", () => {
    if (repeatMode) {
      playSong(currentSongIndex);
    } else {
      let next = (currentSongIndex + 1) % playlistSongs.length;
      if (next !== 0 || playlistSongs.length > 1) playSong(next);
    }
  });
}

function playSong(idx) {
  if (!playlistSongs[idx]) return;
  currentSongIndex = idx;
  audio.src = playlistSongs[idx].file;
  audio.load();
  audio.play().catch(e => console.warn("Play error:", e));
  isPlaying = true;
  document.getElementById("currentSongTitle").innerText = playlistSongs[idx].title;
  document.getElementById("playPauseBtn").className = "fas fa-pause-circle";
  updateActivePlaylist();
}

function togglePlayPause() {
  if (!audio.src) {
    playSong(0);
    return;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").className = "fas fa-play-circle";
  } else {
    audio.play();
    isPlaying = true;
    document.getElementById("playPauseBtn").className = "fas fa-pause-circle";
  }
}

function updateActivePlaylist() {
  const items = document.querySelectorAll("#playlist li");
  items.forEach((li, i) => {
    if (i === currentSongIndex) li.classList.add("active-track");
    else li.classList.remove("active-track");
  });
}

// -------------------- Profile Picture Upload --------------------
function updatePfpDisplay() {
  const circle = document.getElementById("pfpCircle");
  if (!circle) return;
  if (currentPfpUrl) {
    circle.innerHTML = `<img src="${currentPfpUrl}" alt="profile">`;
  } else {
    circle.innerHTML = `<i class="fas fa-user-graduate"></i>`;
  }
}

document.getElementById("pfpClickArea")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentPfpUrl = ev.target.result;
        updatePfpDisplay();
        saveData();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

// -------------------- Modal & Event Listeners --------------------
let pendingModalCb = null;

function openTaskModal(titleText, onConfirm) {
  const modal = document.getElementById("taskModal");
  document.getElementById("modalTitle").innerText = titleText;
  document.getElementById("taskTitleInput").value = "";
  document.getElementById("taskDaySelect").value = "today";
  modal.style.display = "flex";
  pendingModalCb = onConfirm;
}

document.getElementById("confirmTaskBtn").onclick = () => {
  const title = document.getElementById("taskTitleInput").value;
  const day = document.getElementById("taskDaySelect").value;
  if (title && pendingModalCb) {
    pendingModalCb(title, day);
  }
  document.getElementById("taskModal").style.display = "none";
  pendingModalCb = null;
};
document.querySelector(".close-modal").onclick = () => document.getElementById("taskModal").style.display = "none";
window.onclick = (e) => {
  if (e.target === document.getElementById("taskModal")) document.getElementById("taskModal").style.display = "none";
};

document.getElementById("addDailyTaskBtn").onclick = () => {
  openTaskModal("➕ New daily task", (title, day) => addNewTask(title, day === "today" ? "today" : day));
};
document.getElementById("addWeeklyTaskBtn").onclick = () => {
  openTaskModal("📅 Add to weekly plan", addNewTask);
};
document.getElementById("addRecordBtn").onclick = () => {
  let note = prompt("✍️ Write a quick note (running record)");
  if (note) addRunningNote(note);
};

// -------------------- Set current date --------------------
document.getElementById("currentDate").innerText = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// -------------------- INIT --------------------
loadData();
initPlaylist();
renderAll();