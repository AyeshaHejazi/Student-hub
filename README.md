# 🌱 écru · student hub

**An aesthetic, Pinteresty student dashboard** to manage tasks, track progress, listen to focus music, and stay organized — all in one place.

🔗 **Live demo:** (https://AyeshaHejazi.github.io/Student-hub)
---

## ✨ Features

- 📅 **Calendar** – visual overview of the current month, highlights days with tasks
- ✅ **Daily Planner** – today’s tasks with checkboxes & delete option
- 📆 **Weekly Plan** – tasks grouped by day (Monday – Sunday)
- 🚀 **Upcoming Tracker** – all non‑daily tasks, mark complete, see completion rate & progress bar
- 🎵 **Music Playlist** – upload your own 5 MP3s, play/pause, volume slider, repeat mode
- ⏱️ **Study Timer** – 25‑minute Pomodoro timer with start/pause/reset
- 📝 **Running Record** – quick sticky notes for thoughts, ideas, or reminders
- 🖼️ **Profile Picture** – click to upload your own image (saved locally)
- 💾 **Persistent Storage** – all tasks, notes, and profile picture are saved in your browser (localStorage)
- 📱 **Fully Responsive** – works on desktop, tablet, and mobile
- 🎨 **Soft, Warm Design** – serif + sans fonts, rounded cards, earthy tones (Pinterest vibe)

---

## 🛠️ How to Use (for yourself)

1. **Download** or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
3. Add your **5 MP3 files** (see instructions below).
4. Start adding tasks, notes, and enjoy the timer.

> No internet connection needed after the first load – everything works offline!

---

## 🎵 Adding Your Own Music

1. Put your **5 MP3 files** into the **same folder** as `index.html`.
2. Open `script.js` and find this block (around line 12):

```javascript
const playlistSongs = [
  { title: "Lofi Study Beat",  file: "song1.mp3" },
  { title: "Deep Focus",       file: "song2.mp3" },
  { title: "Rainy Day Jazz",   file: "song3.mp3" },
  { title: "Ambient Piano",    file: "song4.mp3" },
  { title: "Chill Electronica",file: "song5.mp3" }
];
