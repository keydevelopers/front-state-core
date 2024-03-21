import { getRegistrations, State } from "./context.ts";

/**
 * the update buffer where updates wait to be notified
 * first state in first out however updates are not exactly FIFO
 */
const buffer = new Map<State, Readonly<[any, any]>[]>();
const maxSleepTime = 2500;
const minSleepTime = 75;
const nextRun: { on: number; handle: number | null } = {
  on: Infinity,
  handle: null,
};

/**
 * notifies on all accumulated updates
 * then calls it self after a timed delay (setTimeout)
 */
function update(): void {
  buffer.forEach((updates, state) => {
    const registrations = getRegistrations(state);
    buffer.delete(state);

    for (let j = 0; j < updates.length; j++) {
      const update = updates[j];
      for (let i = 0; i < registrations.length; i++) {
        const watch = registrations[i];
        if (watch) {
          watch(update[0], update[1]);
        }
      }
    }
  });
  if (nextRun.handle) {
    clearTimeout(nextRun.handle);
  }
  if (buffer.size) {
    nextRun.on = Date.now() + minSleepTime;
    nextRun.handle = setTimeout(update, minSleepTime);
  } else {
    nextRun.on = Date.now() + maxSleepTime;
    nextRun.handle = setTimeout(update, maxSleepTime);
  }
}

export enum UpdateType {
  override,
  newestFirst,
  oldestFirst,
}

/**
 * adds updates to an notify buffer, the buffer gets notified between min-max sleep time
 * @param type what to do with old updates if this is not the first update (between notification runs)
 */
export default function notify(
  state: State,
  value: any,
  oldValue: any,
  type = UpdateType.override,
): void {
  const updates = [value, oldValue] as const;
  const current = buffer.get(state);

  if (current && type !== UpdateType.override) {
    if (type === UpdateType.newestFirst) {
      current.unshift(updates);
    } else {
      current.push(updates);
    }
  } else {
    buffer.set(state, [updates]);
  }
  const now = Date.now();
  if (nextRun.on > now + minSleepTime) {
    update();
  }
}