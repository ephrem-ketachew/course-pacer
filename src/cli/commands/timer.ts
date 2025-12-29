import { PomodoroTimer } from '../../core/timer/pomodoro-timer.js';
import chalk from 'chalk';
import readline from 'readline';
export async function executeTimer(
  options: {
    work?: number;
    break?: number;
    start?: boolean;
  }
): Promise<void> {
  const timer = new PomodoroTimer();
  if (options.work && options.break) {
    timer.setDurations(options.work, options.break);
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  timer.on('tick', (remaining: number) => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const mode = timer.isInBreak() ? chalk.yellow('BREAK') : chalk.green('WORK');
    process.stdout.write(`\r${mode} - ${timeStr}   `);
  });
  timer.on('complete', () => {
    console.log('\n' + chalk.green('✓ Work session complete!'));
    console.log(chalk.yellow('⏸️  Break time! Press Enter to start break...'));
  });
  timer.on('breakStart', () => {
    console.log(chalk.yellow('☕ Break started. Relax!'));
  });
  timer.on('breakComplete', () => {
    console.log(chalk.green('✓ Break complete! Ready for next session.'));
  });
  console.log(chalk.bold('🍅 Pomodoro Timer'));
  console.log('═'.repeat(50));
  console.log('Commands:');
  console.log('  start - Start/resume timer');
  console.log('  pause - Pause timer');
  console.log('  stop - Stop timer');
  console.log('  quit - Exit timer');
  console.log('');
  if (options.start) {
    timer.start();
  }
  while (true) {
    const input = await question('\n> ');
    switch (input.trim().toLowerCase()) {
      case 'start':
        timer.start();
        console.log(chalk.green('Timer started'));
        break;
      case 'pause':
        timer.pause();
        console.log(chalk.yellow('Timer paused'));
        break;
      case 'stop':
        timer.stop();
        console.log(chalk.red('Timer stopped'));
        break;
      case 'quit':
      case 'exit':
        timer.stop();
        rl.close();
        return;
      default:
        console.log(chalk.gray('Unknown command. Use: start, pause, stop, quit'));
    }
  }
}
