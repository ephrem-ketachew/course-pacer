# Course Pacer - Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

## Running the CLI

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Or use the built binary directly:
```bash
node dist/bin/pacer.js
```

### Global Installation (Optional)
```bash
npm link
```
Then use `pacer` command from anywhere.

## Basic Usage

### 1. Scan a Course Directory
```bash
pacer scan "C:\Path\To\Your\Course"
```

This will:
- Recursively scan for video files (.mp4, .mkv, .avi, .mov, etc.)
- Extract metadata (duration, size, format)
- Create a course entry in the database
- Display scan results

### 2. Check Course Status
```bash
pacer status
```

Or for a specific course:
```bash
pacer status "C:\Path\To\Your\Course"
```

With detailed section breakdown:
```bash
pacer status --detailed
```

### 3. Generate a Study Plan
```bash
pacer plan 3h
```

This generates a plan for 3 hours of study time, including:
- List of videos to watch
- Time breakdown (video time + practice time)
- Checkpoint information

Options:
- `--from <checkpoint>` - Start from last, beginning, or specific checkpoint
- `--section <section>` - Limit to specific section
- `--no-practice` - Exclude practice time

### 4. Mark Videos as Watched
```bash
pacer mark "video.mp4" --watched
```

Or toggle status:
```bash
pacer mark "video.mp4"
```

Bulk operations:
```bash
pacer mark "C:\Path\To\Course" --all --watched
pacer mark "C:\Path\To\Course" --section "Section 01" --watched
```

### 5. Configure Settings
```bash
pacer config
```

Or use flags:
```bash
pacer config --speed 1.5
pacer config --multiplier "Section 06:3.0"
```

### 6. Analyze Course
```bash
pacer analyze
```

Options:
- `--section <section>` - Filter by section
- `--watched` - Show only watched videos
- `--unwatched` - Show only unwatched videos
- `--json` - Output as JSON
- `--csv` - Output as CSV
- `-o <file>` - Save report to file

### 7. Launch Videos
```bash
pacer launch "video.mp4"
```

Opens the video in your default media player.

### 8. Pomodoro Timer
```bash
pacer timer
```

Or start immediately:
```bash
pacer timer --start
```

Custom durations:
```bash
pacer timer --work 30 --break 10
```

### 9. Export to Calendar
```bash
pacer export calendar "C:\Path\To\Course" --time 3h -o study-plan.ics
```

### 10. Deadline Calculator
Calculate requirements:
```bash
pacer deadline "C:\Path\To\Course" --deadline "2024-12-31"
```

Suggest optimal deadline:
```bash
pacer deadline "C:\Path\To\Course" --suggest --hours-per-day 2
```

## Testing

Run all tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Development

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Database Location

The application stores data in:
- **Windows**: `%APPDATA%\course-pacer\database.json`
- **macOS/Linux**: `~/.config/course-pacer/database.json`

## Example Workflow

1. **Initial Setup:**
   ```bash
   pacer scan "C:\Courses\React\Complete\Guide"
   ```

2. **Check Progress:**
   ```bash
   pacer status "C:\Courses\React\Complete\Guide" --detailed
   ```

3. **Plan Today's Study:**
   ```bash
   pacer plan 2h "C:\Courses\React\Complete\Guide"
   ```

4. **Mark Videos as You Watch:**
   ```bash
   pacer mark "01-intro.mp4" --watched
   ```

5. **Generate Report:**
   ```bash
   pacer analyze "C:\Courses\React\Complete\Guide" -o report.json
   ```

## Troubleshooting

### FFmpeg/FFprobe Issues
The application bundles FFmpeg binaries, so no manual installation is needed. If you encounter issues:
- Ensure Node.js version >= 20.0.0
- Try rebuilding: `npm run build`

### Database Issues
If the database becomes corrupted:
- Delete `database.json` from the app data directory
- Re-scan your courses

### Path Issues
- Use quotes around paths with spaces
- Use forward slashes or escaped backslashes in paths
- On Windows, use full paths or relative paths

## Features

✅ Smart video scanning with metadata extraction
✅ Progress tracking with section-level breakdown
✅ Intelligent session planning with practice time
✅ Gamification (streaks, achievements)
✅ Gap detection for missing files
✅ Pomodoro timer
✅ Calendar export
✅ Deadline calculator
✅ Video launcher
✅ Comprehensive analysis and reporting

