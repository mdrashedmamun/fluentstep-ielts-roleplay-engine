import { promises as fs } from 'fs';

interface LockOptions {
  timeout?: number; // milliseconds
  waitInterval?: number; // milliseconds
  owner?: string;
}

interface LockInfo {
  locked_by: string;
  locked_at: string;
  timeout_ms: number;
  acquired_at: number;
}

const DEFAULT_TIMEOUT = 300000; // 5 minutes
const DEFAULT_WAIT_INTERVAL = 1000; // 1 second

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeWarn = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
};

const isLockInfo = (value: unknown): value is LockInfo => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<LockInfo>;
  return (
    typeof candidate.locked_by === 'string' &&
    typeof candidate.locked_at === 'string' &&
    typeof candidate.timeout_ms === 'number' &&
    typeof candidate.acquired_at === 'number'
  );
};

/**
 * Acquire a file lock with timeout and retry logic
 * Prevents concurrent writes to critical files (e.g., staticData.ts)
 */
export async function acquireLock(
  lockFilePath: string,
  options: LockOptions = {}
): Promise<LockInfo> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const waitInterval = options.waitInterval ?? DEFAULT_WAIT_INTERVAL;
  const owner = options.owner ?? 'unknown-agent';

  const startTime = Date.now();
  const lockInfo: LockInfo = {
    locked_by: owner,
    locked_at: new Date().toISOString(),
    timeout_ms: timeout,
    acquired_at: startTime,
  };

  while (true) {
    try {
      // Try to write lock file exclusively (fail if exists)
      const fileHandle = await fs.open(lockFilePath, 'wx');
      await fileHandle.writeFile(JSON.stringify(lockInfo, null, 2));
      await fileHandle.close();

      writeOut(`✅ Lock acquired by ${owner}`);
      return lockInfo;
    } catch (error) {
      // Lock file already exists
      if (getErrorCode(error) === 'EEXIST') {
        const elapsed = Date.now() - startTime;

        if (elapsed > timeout) {
          // Timeout: force release stale lock
          writeWarn(
            `⚠️  Lock timeout (${elapsed}ms > ${timeout}ms). Force releasing stale lock.`
          );
          try {
            await fs.unlink(lockFilePath);
          } catch {
            // Lock already released or doesn't exist
          }
          continue;
        }

        // Wait and retry
        writeOut(
          `⏳ Waiting for lock (${elapsed}ms/${timeout}ms)... retrying in ${waitInterval}ms`
        );
        await sleep(waitInterval);
        continue;
      }

      throw error;
    }
  }
}

/**
 * Release a file lock
 */
export async function releaseLock(lockFilePath: string): Promise<void> {
  try {
    await fs.unlink(lockFilePath);
    writeOut('✅ Lock released');
  } catch (error) {
    if (getErrorCode(error) === 'ENOENT') {
      writeWarn('⚠️  Lock file not found (already released)');
    } else {
      throw error;
    }
  }
}

/**
 * Check if a lock is held
 */
export async function isLocked(lockFilePath: string): Promise<boolean> {
  try {
    await fs.access(lockFilePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get lock info if lock exists
 */
export async function getLockInfo(lockFilePath: string): Promise<LockInfo | null> {
  try {
    const content = await fs.readFile(lockFilePath, 'utf-8');
    const parsed: unknown = JSON.parse(content);
    return isLockInfo(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Force release a lock (use with caution)
 */
export async function forceReleaseLock(lockFilePath: string): Promise<void> {
  try {
    await fs.unlink(lockFilePath);
    writeOut('🔓 Force released lock');
  } catch (error) {
    if (getErrorCode(error) === 'ENOENT') {
      writeWarn('⚠️  Lock file not found');
    } else {
      throw error;
    }
  }
}

/**
 * Utility sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
