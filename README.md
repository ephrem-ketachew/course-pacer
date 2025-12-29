# Course Pacer 🎯

An intelligent CLI tool for managing and pacing video-based courseware. Transform static video folders into a dynamic, trackable learning curriculum.

## ✨ Features

- 🎯 **Smart Scanning**: Automatically discover and catalog video files recursively
- 📊 **Progress Tracking**: Track your learning progress with detailed statistics
- ⏱️ **Session Planning**: Generate personalized study plans based on time budgets
- 🎮 **Gamification**: Track completion and maintain study streaks
- ⚡ **Zero Setup**: Bundled FFmpeg binaries - no manual installation required
- 📈 **Analytics**: Comprehensive analysis and reporting capabilities
- ⚙️ **Flexible Configuration**: Customize playback speed and practice multipliers

## 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>
cd course-planner

# Install dependencies
npm install

# Build the project
npm run build
```

## 📖 Usage

### Scanning Courses

Scan a directory to discover and catalog video files:

```bash
# Basic scan
pacer scan "C:\Courses\React Masterclass"

# Force re-scan (ignore existing data)
pacer scan "C:\Courses\React Masterclass" --force

# Quiet mode (minimal output)
pacer scan "C:\Courses\React Masterclass" --quiet
```

### Checking Progress

View your learning progress:

```bash
# Status of all courses
pacer status

# Status of a specific course
pacer status "C:\Courses\React Masterclass"

# Detailed section-level progress
pacer status "C:\Courses\React Masterclass" --detailed

# JSON output
pacer status --json
```

### Planning Study Sessions

Generate personalized study plans:

```bash
# Plan for 3 hours
pacer plan 3h

# Plan starting from last watched video
pacer plan 2h --from last

# Plan from beginning
pacer plan 2h --from beginning

# Plan specific section only
pacer plan 1h --section "Section 06"

# Plan without practice time
pacer plan 2h --no-practice

# Plan for specific course
pacer plan 3h "C:\Courses\React Masterclass"
```

### Marking Videos

Track which videos you've watched:

```bash
# Mark a video as watched
pacer mark "video.mp4" --watched

# Mark as unwatched
pacer mark "video.mp4" --unwatched

# Toggle watched status (default)
pacer mark "video.mp4"

# Mark all videos in a section
pacer mark "C:\Courses\React" --section "Section 06" --watched

# Add notes to a video
pacer mark "video.mp4" --watched --notes "Great introduction!"
```

### Configuration

Configure playback speed and practice multipliers:

```bash
# Interactive configuration menu
pacer config

# Set global playback speed
pacer config --speed 1.5

# Set practice multiplier for a section
pacer config "C:\Courses\React" --multiplier "Section 06:3.0"

# Reset to defaults
pacer config --reset
```

### Analysis & Reporting

Analyze courses and generate reports:

```bash
# Analyze a course
pacer analyze "C:\Courses\React Masterclass"

# Analyze with filters
pacer analyze "C:\Courses\React" --section "Section 06"
pacer analyze "C:\Courses\React" --watched
pacer analyze "C:\Courses\React" --format mp4

# Export to file
pacer analyze "C:\Courses\React" --json -o report.json
pacer analyze "C:\Courses\React" --csv -o report.csv
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📋 Commands Reference

### `pacer scan <path>`
Scan a directory for video files and update the database.

**Options:**
- `-f, --force`: Force re-scan even if course already exists
- `-q, --quiet`: Suppress output (except errors)

### `pacer status [path]`
Show current progress and statistics.

**Options:**
- `-d, --detailed`: Show detailed section-level progress
- `--json`: Output as JSON

### `pacer plan <time> [course-path]`
Generate a study session plan.

**Options:**
- `--from <checkpoint>`: Start from checkpoint (last, beginning, checkpoint, or video-id)
- `--section <section>`: Limit to specific section
- `--no-practice`: Exclude practice time from budget
- `--json`: Output as JSON

### `pacer mark <video-id>`
Mark a video as watched or unwatched.

**Options:**
- `-w, --watched`: Mark as watched
- `-u, --unwatched`: Mark as unwatched
- `-a, --all`: Mark all videos in course
- `-s, --section <section>`: Mark all videos in section
- `-n, --notes <notes>`: Add notes to video

### `pacer config [course-path]`
Interactive configuration menu.

**Options:**
- `--speed <speed>`: Set playback speed (e.g., 1.5)
- `--multiplier <folder:value>`: Set practice multiplier for folder
- `--reset`: Reset to defaults

### `pacer analyze [course-path]`
Analyze a course directory and display statistics.

**Options:**
- `--section <section>`: Filter by section
- `--watched`: Show only watched videos
- `--unwatched`: Show only unwatched videos
- `--format <format>`: Filter by video format
- `--json`: Output as JSON
- `--csv`: Output as CSV
- `-o, --output <file>`: Save report to file

## 🎯 Key Concepts

### Time Formats
Time can be specified in hours (`h`) or minutes (`m`):
- `3h` = 3 hours
- `180m` = 180 minutes
- `2.5h` = 2.5 hours

### Practice Multipliers
Practice multipliers determine how much practice time to allocate per video:
- `1.0x` = Same practice time as video duration
- `3.0x` = 3x practice time (e.g., 1 hour video = 3 hours practice)
- `0.0x` = No practice time

### Checkpoints
Checkpoints mark where to resume studying:
- `last`: Start from last watched video (default)
- `beginning`: Start from first unwatched video
- `checkpoint`: Use course checkpoint
- `<video-id>`: Start from specific video

## 📁 Project Structure

```
course-planner/
├── src/
│   ├── cli/          # CLI commands
│   ├── core/        # Core functionality
│   │   ├── scanner/ # Video scanning
│   │   ├── tracker/ # Progress tracking
│   │   ├── planner/ # Session planning
│   │   └── analyzer/# Analysis & reporting
│   ├── models/      # Data models
│   ├── storage/     # Database layer
│   └── utils/       # Utility functions
├── bin/             # CLI entry point
└── tests/           # Test files
```

## 🔧 Requirements

- **Node.js**: >= 20.0.0
- **TypeScript**: 5.x
- **Platform**: Windows (initial target)

## 📝 License

ISC

## 🤝 Contributing

This project is feature-complete for the CLI version (v1.0.0). See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the complete roadmap and contribution guidelines.

**Status**: ✅ All core features (Phases 0-6) are complete. Phase 7 (Desktop GUI) is planned for future releases.

## 🐛 Troubleshooting

### FFprobe Not Found
The tool bundles FFprobe binaries automatically. If you encounter issues:
1. Ensure you're using Node.js >= 20.0.0
2. Try reinstalling dependencies: `npm install`
3. Check that `ffprobe-static` is installed correctly

### Course Not Found
If you get "Course not found" errors:
1. Make sure you've scanned the directory first: `pacer scan <path>`
2. Verify the path is correct and accessible
3. Use `pacer status` to see all available courses

### Invalid Time Format
Time must be in format: `<number><unit>` where unit is `h` (hours) or `m` (minutes).
Examples: `3h`, `180m`, `2.5h`

## 📚 Additional Resources

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [API Documentation](./docs/API.md) - API reference
