# Course Pacer API Documentation

## Overview

Course Pacer provides a comprehensive CLI interface for managing video-based courseware. This document describes all available commands and their options.

## Commands

### `scan`

Scan a directory for video files and update the database.

**Syntax:**
```bash
pacer scan <path> [options]
```

**Arguments:**
- `<path>` (required): Directory path to scan

**Options:**
- `-f, --force`: Force re-scan even if course already exists
- `-q, --quiet`: Suppress output (except errors)

**Examples:**
```bash
pacer scan "C:\Courses\React Masterclass"
pacer scan ./my-course --force
pacer scan "C:\Courses\Python" --quiet
```

---

### `status`

Show current progress and statistics.

**Syntax:**
```bash
pacer status [path] [options]
```

**Arguments:**
- `[path]` (optional): Course path. If omitted, shows all courses.

**Options:**
- `-d, --detailed`: Show detailed section-level progress
- `--json`: Output as JSON

**Examples:**
```bash
pacer status
pacer status "C:\Courses\React"
pacer status "C:\Courses\React" --detailed
pacer status --json
```

---

### `plan`

Generate a study session plan.

**Syntax:**
```bash
pacer plan <time> [course-path] [options]
```

**Arguments:**
- `<time>` (required): Time budget (e.g., "3h", "180m", "2.5h")
- `[course-path]` (optional): Course path. Uses first course if omitted.

**Options:**
- `--from <checkpoint>`: Start from checkpoint (last, beginning, checkpoint, or video-id). Default: `last`
- `--section <section>`: Limit to specific section
- `--no-practice`: Exclude practice time from budget
- `--json`: Output as JSON

**Examples:**
```bash
pacer plan 3h
pacer plan 2h "C:\Courses\React"
pacer plan 2h --from beginning
pacer plan 1h --section "Section 06"
pacer plan 2h --no-practice
```

---

### `mark`

Mark a video as watched or unwatched.

**Syntax:**
```bash
pacer mark <video-id> [options]
```

**Arguments:**
- `<video-id>` (required): Video ID, filename, or course path

**Options:**
- `-w, --watched`: Mark as watched
- `-u, --unwatched`: Mark as unwatched
- `-a, --all`: Mark all videos in course
- `-s, --section <section>`: Mark all videos in section
- `-n, --notes <notes>`: Add notes to video

**Examples:**
```bash
pacer mark "video.mp4" --watched
pacer mark "video.mp4" --unwatched
pacer mark "video.mp4"  # Toggle
pacer mark "C:\Courses\React" --section "Section 06" --watched
pacer mark "video.mp4" --watched --notes "Great intro!"
```

---

### `config`

Interactive configuration menu.

**Syntax:**
```bash
pacer config [course-path] [options]
```

**Arguments:**
- `[course-path]` (optional): Course path. Configures first course if omitted.

**Options:**
- `--speed <speed>`: Set playback speed (e.g., 1.5)
- `--multiplier <folder:value>`: Set practice multiplier for folder (format: folder:value)
- `--reset`: Reset to defaults

**Examples:**
```bash
pacer config
pacer config "C:\Courses\React"
pacer config --speed 1.5
pacer config "C:\Courses\React" --multiplier "Section 06:3.0"
pacer config --reset
```

---

### `analyze`

Analyze a course directory and display statistics.

**Syntax:**
```bash
pacer analyze [course-path] [options]
```

**Arguments:**
- `[course-path]` (optional): Course path. Uses first course if omitted.

**Options:**
- `--section <section>`: Filter by section
- `--watched`: Show only watched videos
- `--unwatched`: Show only unwatched videos
- `--format <format>`: Filter by video format
- `--json`: Output as JSON
- `--csv`: Output as CSV
- `-o, --output <file>`: Save report to file

**Examples:**
```bash
pacer analyze
pacer analyze "C:\Courses\React"
pacer analyze "C:\Courses\React" --section "Section 06"
pacer analyze "C:\Courses\React" --watched
pacer analyze "C:\Courses\React" --json -o report.json
pacer analyze "C:\Courses\React" --csv -o report.csv
```

---

## Time Formats

Time can be specified in hours (`h`) or minutes (`m`):

- `3h` = 3 hours
- `180m` = 180 minutes
- `2.5h` = 2.5 hours
- `90m` = 90 minutes

## Error Handling

All commands provide user-friendly error messages with helpful tips. Common errors include:

- **Course Not Found**: Run `pacer scan <path>` to add the course
- **Video Not Found**: Use `pacer status` to see available videos
- **Invalid Time Format**: Use format like "3h" or "180m"
- **Invalid Path**: Ensure the path exists and is accessible

## Exit Codes

- `0`: Success
- `1`: Error occurred

## Environment Variables

- `DEBUG`: Set to enable detailed error stack traces

