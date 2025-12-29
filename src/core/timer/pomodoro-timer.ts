import { EventEmitter } from 'events';
export type TimerState = 'idle' | 'running' | 'paused' | 'break';
export interface TimerEvents {
  tick: (remaining: number) => void;
  complete: () => void;
  breakStart: () => void;
  breakComplete: () => void;
}
export class PomodoroTimer extends EventEmitter {
  private state: TimerState = 'idle';
  private remainingSeconds: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private workDuration: number = 25 * 60; 
  private breakDuration: number = 5 * 60; 
  private isBreak: boolean = false;
  start(): void {
    if (this.state === 'running') {
      return;
    }
    if (this.state === 'paused' && this.remainingSeconds > 0) {
      this.state = 'running';
    } else {
      this.remainingSeconds = this.isBreak
        ? this.breakDuration
        : this.workDuration;
      this.state = 'running';
    }
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.emit('tick', this.remainingSeconds);
      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
  }
  pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
  stop(): void {
    this.state = 'idle';
    this.remainingSeconds = 0;
    this.isBreak = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  private complete(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.isBreak) {
      this.isBreak = false;
      this.state = 'idle';
      this.emit('breakComplete');
    } else {
      this.isBreak = true;
      this.remainingSeconds = this.breakDuration;
      this.state = 'idle';
      this.emit('complete');
      this.emit('breakStart');
    }
  }
  getState(): TimerState {
    return this.state;
  }
  getRemaining(): number {
    return this.remainingSeconds;
  }
  isInBreak(): boolean {
    return this.isBreak;
  }
  setDurations(workMinutes: number, breakMinutes: number): void {
    this.workDuration = workMinutes * 60;
    this.breakDuration = breakMinutes * 60;
  }
}
