import { getRegistrations, State } from "./context.ts";

const queue = new Map<State, Readonly<[any, any]>[]>();
const maxSleepTime = 2500;
const minSleepTime = 75;
const nextRun: { on: number; handle: number | null } = {
  on: Infinity,
  handle: null,
};

function update(): void {
  queue.forEach((updates, state) => {
    const registrations = getRegistrations(state);
    queue.delete(state);

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
  if (queue.size) {
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

export default function notify(
  state: State,
  value: any,
  oldValue: any,
  type = UpdateType.override,
): void {
  const updates = [value, oldValue] as const;
  const current = queue.get(state);

  if (current && type !== UpdateType.override) {
    if (type === UpdateType.newestFirst) {
      current.unshift(updates);
    } else {
      current.push(updates);
    }
  } else {
    queue.set(state, [updates]);
  }
  const now = Date.now();
  if (nextRun.on > now + minSleepTime) {
    update();
  }
}