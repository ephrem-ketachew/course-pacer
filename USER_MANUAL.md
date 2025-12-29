# Course Pacer - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Commands](#basic-commands)
3. [Advanced Features](#advanced-features)
4. [Common Scenarios](#common-scenarios)
5. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Installation

```bash
npm install
npm run build
```

### Running Commands

Use one of these methods:
```bash
npm start -- <command> [options]
node dist/bin/pacer.js <command> [options]
```

For global installation:
```bash
npm link
pacer <command> [options]
```

---

## Basic Commands

### 1. Scan Command

Scans a directory for video files and creates a course entry in the database.

**Syntax:**
```bash
pacer scan <path> [options]
```

**Options:**
- `-f, --force` - Force re-scan even if course already exists
- `-q, --quiet` - Suppress output (except errors)

**Examples:**
```bash
pacer scan "C:\Courses\React Masterclass"
pacer scan "C:\Courses\Python" --force
pacer scan "C:\Courses\JavaScript" --quiet
```

**What it does:**
- Recursively discovers video files (.mp4, .mkv, .avi, .mov, etc.)
- Extracts metadata (duration, size, format) using FFprobe
- Creates a course entry with unique ID
- Detects sections from folder structure
- Shows scan summary with statistics

**Output:**
- Total videos found
- Total duration
- Total size
- Number of sections
- List of sections with video counts

---

### 2. Status Command

Shows current progress and statistics for courses.

**Syntax:**
```bash
pacer status [path] [options]
```

**Options:**
- `-d, --detailed` - Show detailed section-level progress
- `--json` - Output as JSON

**Examples:**
```bash
pacer status
pacer status "C:\Courses\React"
pacer status "C:\Courses\React" --detailed
pacer status --json
```

**What it shows:**
- Course name and path
- Total videos vs watched videos
- Completion percentage
- Total duration vs watched duration
- Remaining duration
- Last watched video
- Section-level breakdown (with --detailed)

---

### 3. Plan Command

Generates a personalized study session plan based on available time.

**Syntax:**
```bash
pacer plan <time> [course-path] [options]
```

**Arguments:**
- `<time>` - Time budget in format: `3h`, `180m`, `2.5h`

**Options:**
- `--from <checkpoint>` - Start from: `last`, `beginning`, `checkpoint`, or `<video-id>`
- `--section <section>` - Limit to specific section
- `--no-practice` - Exclude practice time from budget
- `--json` - Output as JSON

**Examples:**
```bash
pacer plan 3h
pacer plan 2h "C:\Courses\React"
pacer plan 2h --from beginning
pacer plan 1h --section "Section 06"
pacer plan 2h --no-practice
pacer plan 3h --json
```

**What it generates:**
- List of videos to watch in order
- Video durations (adjusted for playback speed)
- Practice time allocation
- Total video time
- Total practice time
- Total session time
- Start and end checkpoints

**Time Format:**
- `3h` = 3 hours
- `180m` = 180 minutes
- `2.5h` = 2.5 hours

---

### 4. Mark Command

Marks videos as watched or unwatched to track progress.

**Syntax:**
```bash
pacer mark <video-id> [options]
```

**Options:**
- `-w, --watched` - Mark as watched
- `-u, --unwatched` - Mark as unwatched
- `-a, --all` - Mark all videos in course
- `-s, --section <section>` - Mark all videos in section
- `-n, --notes <notes>` - Add notes to video

**Examples:**
```bash
pacer mark "video.mp4" --watched
pacer mark "video.mp4" --unwatched
pacer mark "video.mp4"
pacer mark "C:\Courses\React" --all --watched
pacer mark "C:\Courses\React" --section "Section 06" --watched
pacer mark "video.mp4" --watched --notes "Great introduction!"
```

**What it does:**
- Updates video watched status
- Sets checkpoint to last watched video
- Records watched timestamp
- Stores notes if provided
- Updates progress statistics

**Video ID formats:**
- Video filename: `"video.mp4"`
- Video ID: `"abc123def456"`
- Course path: `"C:\Courses\React"` (with --all or --section)

---

### 5. Config Command

Configures playback speed and practice multipliers.

**Syntax:**
```bash
pacer config [course-path] [options]
```

**Options:**
- `--speed <speed>` - Set playback speed (e.g., 1.5)
- `--multiplier <folder:value>` - Set practice multiplier (format: `folder:value`)
- `--reset` - Reset to defaults

**Examples:**
```bash
pacer config
pacer config --speed 1.5
pacer config "C:\Courses\React" --multiplier "Section 06:3.0"
pacer config --reset
```

**Interactive Mode:**
Running `pacer config` without options opens an interactive menu:
- Configure global settings
- Configure course-specific settings
- Set playback speed
- Set practice multipliers per section

**Settings:**
- **Playback Speed**: 0.5x to 3.0x (default: 1.5x)
- **Practice Multiplier**: 0.0x to 10.0x (default: 1.0x)
  - `1.0x` = Same practice time as video duration
  - `3.0x` = 3x practice time
  - `0.0x` = No practice time

---

### 6. Analyze Command

Analyzes courses and generates detailed reports.

**Syntax:**
```bash
pacer analyze [course-path] [options]
```

**Options:**
- `--section <section>` - Filter by section
- `--watched` - Show only watched videos
- `--unwatched` - Show only unwatched videos
- `--format <format>` - Filter by video format
- `--json` - Output as JSON
- `--csv` - Output as CSV
- `-o, --output <file>` - Save report to file

**Examples:**
```bash
pacer analyze
pacer analyze "C:\Courses\React"
pacer analyze "C:\Courses\React" --section "Section 06"
pacer analyze "C:\Courses\React" --watched
pacer analyze "C:\Courses\React" --format mp4
pacer analyze "C:\Courses\React" --json -o report.json
pacer analyze "C:\Courses\React" --csv -o report.csv
```

**What it shows:**
- Total videos and duration
- Watched vs unwatched counts
- Completion percentage
- Section breakdown
- Format distribution
- Average video duration
- Longest and shortest videos

---

### 7. Launch Command

Launches a video in the default media player.

**Syntax:**
```bash
pacer launch <video-id> [course-path]
```

**Examples:**
```bash
pacer launch "video.mp4"
pacer launch "abc123def456" "C:\Courses\React"
```

**What it does:**
- Finds the video by ID or filename
- Opens it in the default media player
- Works with any video player installed on your system

---

### 8. Timer Command

Starts a Pomodoro timer for study sessions.

**Syntax:**
```bash
pacer timer [options]
```

**Options:**
- `--work <minutes>` - Work duration (default: 25)
- `--break <minutes>` - Break duration (default: 5)
- `--start` - Start timer immediately

**Examples:**
```bash
pacer timer
pacer timer --work 30 --break 10
pacer timer --start
```

**What it does:**
- Displays countdown timer
- Alternates between work and break periods
- Provides visual and audio notifications
- Tracks session duration

---

### 9. Export Command

Exports study plans to external formats.

**Syntax:**
```bash
pacer export <type> [course-path] [options]
```

**Arguments:**
- `<type>` - Export type: `calendar`

**Options:**
- `--time <time>` - Time budget for plan (e.g., `3h`)
- `--date <date>` - Start date (YYYY-MM-DD)
- `-o, --output <file>` - Output file path

**Examples:**
```bash
pacer export calendar
pacer export calendar "C:\Courses\React" --time 2h
pacer export calendar --time 3h --date 2024-01-01 -o plan.ics
```

**What it creates:**
- ICS calendar file (.ics)
- Importable into Google Calendar, Outlook, etc.
- Contains study sessions with dates and times

---

### 10. Deadline Command

Calculates study requirements for meeting deadlines.

**Syntax:**
```bash
pacer deadline [course-path] [options]
```

**Options:**
- `--deadline <date>` - Target deadline (YYYY-MM-DD)
- `--suggest` - Suggest optimal deadline
- `--hours-per-day <hours>` - Hours per day for suggestion (default: 2)

**Examples:**
```bash
pacer deadline
pacer deadline "C:\Courses\React" --deadline 2024-12-31
pacer deadline --suggest --hours-per-day 3
```

**What it shows:**
- Total remaining content
- Required hours per day to meet deadline
- Estimated completion date
- Suggested deadline based on study pace

---

## Common Scenarios

### Scenario 1: Starting a New Course

```bash
pacer scan "C:\Courses\New Course"
pacer status "C:\Courses\New Course"
pacer plan 2h "C:\Courses\New Course" --from beginning
```

**Workflow:**
1. Scan the course directory
2. Check status to see what you have
3. Generate your first study plan

---

### Scenario 2: Daily Study Session

```bash
pacer plan 2h
pacer mark "video1.mp4" --watched
pacer mark "video2.mp4" --watched --notes "Important concepts"
pacer status
```

**Workflow:**
1. Generate plan for available time
2. Watch videos from the plan
3. Mark videos as watched as you complete them
4. Add notes for important points
5. Check updated status

---

### Scenario 3: Catching Up After Break

```bash
pacer status --detailed
pacer plan 3h --from last
pacer mark "C:\Courses\React" --section "Section 05" --watched
```

**Workflow:**
1. Review detailed progress
2. Generate plan starting from where you left off
3. Mark entire sections as watched if you've already covered them

---

### Scenario 4: Preparing for Exam

```bash
pacer analyze --unwatched
pacer plan 4h --no-practice
pacer deadline --deadline 2024-12-15
```

**Workflow:**
1. Analyze unwatched content
2. Generate intensive plan without practice time
3. Calculate if you can finish by deadline

---

### Scenario 5: Section-by-Section Learning

```bash
pacer plan 2h --section "Section 06"
pacer mark "C:\Courses\React" --section "Section 06" --watched
pacer analyze --section "Section 06"
```

**Workflow:**
1. Focus on specific section
2. Complete all videos in section
3. Mark entire section as complete
4. Review section statistics

---

### Scenario 6: Customizing Study Pace

```bash
pacer config --speed 1.5
pacer config "C:\Courses\React" --multiplier "Advanced:3.0"
pacer plan 2h
```

**Workflow:**
1. Set faster playback speed
2. Increase practice time for difficult sections
3. Generate optimized plan

---

### Scenario 7: Exporting Study Schedule

```bash
pacer plan 2h --json
pacer export calendar --time 2h --date 2024-01-01 -o schedule.ics
```

**Workflow:**
1. Generate plan
2. Export to calendar format
3. Import into your calendar app

---

### Scenario 8: Tracking Multiple Courses

```bash
pacer scan "C:\Courses\Course1"
pacer scan "C:\Courses\Course2"
pacer status
pacer plan 2h "C:\Courses\Course1"
pacer plan 1h "C:\Courses\Course2"
```

**Workflow:**
1. Scan multiple courses
2. View all courses status
3. Generate plans for different courses

---

## Tips & Best Practices

### Organization

- Use consistent folder structures with section names
- Keep course directories organized
- Use descriptive section names

### Progress Tracking

- Mark videos immediately after watching
- Add notes for important concepts
- Review status regularly to stay motivated

### Time Management

- Use realistic time budgets
- Account for practice time in your schedule
- Use --no-practice for quick reviews

### Configuration

- Adjust playback speed based on content difficulty
- Set higher multipliers for challenging sections
- Use global config for consistent settings

### Planning

- Start with --from last to continue seamlessly
- Use --section to focus on specific topics
- Export plans to calendar for scheduling

### Analysis

- Run analyze regularly to track progress
- Use filters to focus on specific content
- Export reports for documentation

### Best Practices

- Scan courses once, then use status/plan commands
- Use --force only when course structure changes
- Keep database clean by scanning only course directories
- Use quiet mode in scripts: `--quiet`

---

## Troubleshooting

### Course Not Found

**Problem:** `Course not found: <path>`

**Solution:**
```bash
pacer scan "<path>"
pacer status
```

### Invalid Time Format

**Problem:** `Invalid time format`

**Solution:** Use format like `3h` or `180m`
- Valid: `3h`, `180m`, `2.5h`
- Invalid: `3 hours`, `180`, `2h30m`

### FFprobe Errors

**Problem:** Metadata extraction fails

**Solution:**
- Ensure FFprobe is installed (bundled automatically)
- Check video file is not corrupted
- Try --force to re-scan

### No Videos Found

**Problem:** Scan finds 0 videos

**Solution:**
- Check directory path is correct
- Verify video files exist
- Check file extensions are supported (.mp4, .mkv, .avi, .mov, etc.)

---

## File Formats Supported

- MP4 (.mp4)
- MKV (.mkv)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)
- FLV (.flv)
- WebM (.webm)
- M4V (.m4v)
- 3GP (.3gp)

---

## Database Location

The database is stored in your system's app data directory:
- Windows: `%APPDATA%\course-pacer\database.json`
- macOS: `~/Library/Application Support/course-pacer/database.json`
- Linux: `~/.config/course-pacer/database.json`

---

## Command Quick Reference

| Command | Purpose | Key Options |
|---------|---------|-------------|
| `scan` | Discover videos | `--force`, `--quiet` |
| `status` | View progress | `--detailed`, `--json` |
| `plan` | Generate study plan | `--from`, `--section`, `--no-practice` |
| `mark` | Track watched videos | `--watched`, `--all`, `--section` |
| `config` | Configure settings | `--speed`, `--multiplier` |
| `analyze` | Generate reports | `--section`, `--watched`, `--json` |
| `launch` | Open video | - |
| `timer` | Pomodoro timer | `--work`, `--break` |
| `export` | Export plans | `--time`, `--date`, `-o` |
| `deadline` | Calculate deadlines | `--deadline`, `--suggest` |

---

## Examples Summary

**Complete Workflow:**
```bash
pacer scan "C:\Courses\React"
pacer config --speed 1.5
pacer plan 2h --from beginning
pacer mark "video1.mp4" --watched
pacer status --detailed
pacer analyze --json -o report.json
```

**Quick Daily Routine:**
```bash
pacer plan 1h
pacer timer --start
```

**Progress Review:**
```bash
pacer status --detailed
pacer analyze --unwatched
pacer deadline --suggest
```

---

## Quick Reference

For a quick command reference, see the [Cheat Sheet](./CHEAT_SHEET.md) - a condensed guide with the most frequently used commands ordered by usage frequency.

---

For more information, see the [README.md](./README.md) file.

