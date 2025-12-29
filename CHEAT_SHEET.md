# Course Pacer - Quick Command Cheat Sheet

> **📌 Note:** This cheat sheet uses a demo course path (`D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1`) as an example. **Replace it with your actual course path** when using these commands. You can find your course path by running `npm start -- status` to see all scanned courses.

**Demo Course Path:** `D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1`

---

## 🔥 DAILY USE (Most Frequent)

### 1. Generate Study Plan
```bash
npm start -- plan 4h "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Shortcuts:**
- `npm start -- plan 2h` (if only one course)
- `npm start -- plan 3h --no-practice` (exclude practice time)
- `npm start -- plan 1h --section "03. Command Basics"` (specific section)

### 2. Mark Videos as Watched (AFTER WATCHING)
```bash
npm start -- mark "Video Name.mp4" --watched --up-to "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Example:** After watching videos 1-14:
```bash
npm start -- mark "5. Our First Commands!.mp4" --watched --up-to "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Other options:**
- `npm start -- mark "video.mp4" --watched "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"` (single video)
- `npm start -- mark "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1" --all --watched` (mark entire course)
- `npm start -- mark "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1" --section "03. Command Basics" --watched` (mark section)

### 3. Check Progress
```bash
npm start -- status "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Shortcuts:**
- `npm start -- status` (all courses overview)
- `npm start -- status --detailed` (section breakdown)

### 4. Open Video to Watch
```bash
npm start -- launch "Video Name.mp4" "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```

---

## 📅 REGULAR USE (Weekly)

### 5. Start Pomodoro Timer
```bash
npm start -- timer
```
**Options:**
- `npm start -- timer --work 30 --break 10` (custom times)
- `npm start -- timer --start` (start immediately)

### 6. Analyze Course Stats
```bash
npm start -- analyze "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Options:**
- `npm start -- analyze --watched` (only watched videos)
- `npm start -- analyze --section "03. Command Basics"` (filter by section)

---

## ⚙️ OCCASIONAL USE (When Needed)

### 7. Change Settings
```bash
npm start -- config "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"
```
**Quick options:**
- `npm start -- config --speed 1.5` (set playback speed)
- `npm start -- config --multiplier "03. Command Basics:2.0"` (practice multiplier)

### 8. Check Deadline Progress
```bash
npm start -- deadline "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1" --deadline 2025-02-15
```
**Options:**
- `npm start -- deadline --suggest` (suggest optimal deadline)
- `npm start -- deadline --suggest --hours-per-day 3` (custom hours/day)

---

## 🔧 RARE USE (Setup/One-Time)

### 9. Re-scan Course (if videos changed)
```bash
npm start -- scan "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1" --force
```

### 10. Export Calendar
```bash
npm start -- export calendar "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1" --time 4h --date 2025-01-01
```

---

## 🎯 TYPICAL DAILY WORKFLOW

**Morning:**
1. `npm start -- plan 4h` → Get today's study plan
2. `npm start -- timer --start` → Start Pomodoro timer

**During Study:**
3. `npm start -- launch "Video Name.mp4"` → Open video
4. Watch and practice

**After Session:**
5. `npm start -- mark "Last Video You Watched.mp4" --watched --up-to "D:\Udemy - The Linux Command Line Bootcamp Beginner To Power User 1080 2025-1"` → Mark all watched
6. `npm start -- status` → Check progress

**End of Day:**
7. `npm start -- status --detailed` → See detailed progress

---

## 💡 PRO TIPS

- **Use `--up-to` flag** - Saves time! Marks all videos up to the one you specify
- **Omit course path** - If you only have one course, you can skip the long path
- **Check `--help`** - Any command: `npm start -- plan --help`
- **Use quotes** - Always quote paths with spaces: `"D:\Udemy..."`
- **Time formats** - Use `2h`, `90m`, `1.5h` (all work)

---

## 🚀 QUICK REFERENCE

| Task | Command |
|------|---------|
| **Daily plan** | `npm start -- plan 4h` |
| **Mark watched** | `npm start -- mark "video.mp4" --watched --up-to "D:\Udemy..."` |
| **Check progress** | `npm start -- status` |
| **Open video** | `npm start -- launch "video.mp4"` |
| **Start timer** | `npm start -- timer --start` |
| **Change speed** | `npm start -- config --speed 1.5` |
| **Check deadline** | `npm start -- deadline --suggest` |

---

**Save this file and keep it handy!** 📌

