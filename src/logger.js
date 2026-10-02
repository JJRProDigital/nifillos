import { appendFile, mkdir, readFile, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';

export const MAX_LOG_BYTES = 1024 * 1024; // rotate cli.log to cli.log.old past 1 MB

export async function logEvent(action, details = {}, targetDir = process.cwd()) {
  try {
    const logDir = join(targetDir, '_nifillos', 'logs');
    const logPath = join(logDir, 'cli.log');
    await mkdir(logDir, { recursive: true });
    await rotateLogIfNeeded(logPath, join(logDir, 'cli.log.old'));
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
    await appendFile(logPath, entry + '\n', 'utf-8');
  } catch {
    // Silent — logging must never break the operation
  }
}

async function rotateLogIfNeeded(logPath, backupPath) {
  try {
    const st = await stat(logPath);
    if (st.size > MAX_LOG_BYTES) {
      await rename(logPath, backupPath);
    }
  } catch {
    // No log file yet — nothing to rotate
  }
}

export async function readCliLogs({ action, limit } = {}, targetDir = process.cwd()) {
  try {
    const logDir = join(targetDir, '_nifillos', 'logs');
    const entries = [];
    // Newest file first: cli.log (current), then cli.log.old (previous rotation)
    for (const file of ['cli.log', 'cli.log.old']) {
      let raw;
      try {
        raw = await readFile(join(logDir, file), 'utf-8');
      } catch {
        continue;
      }
      for (const line of raw.trim().split('\n')) {
        try {
          entries.push(JSON.parse(line));
        } catch {
          // Skip malformed lines
        }
      }
    }
    entries.reverse(); // newest first
    let filtered = entries;
    if (action) filtered = entries.filter((e) => e.action === action);
    if (limit) filtered = filtered.slice(0, limit);
    return filtered;
  } catch {
    return [];
  }
}
