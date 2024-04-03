import { getRegistrations, State } from "./context.ts";
import { UpdateType } from "./update-type.ts";

/**
 * the update buffer where updates wait to be notified
 * first state in first out however updates are not exactly FIFO
 */
const buffer = new Map<State, Readonly<[any, any]>[]>();
const nextRun: { on: number; handle: number | null } = {
  on: Infinity,
  handle: null,
};
/**
 * the gap between one update run and the next
 */
let gap = 75;
/**
 * the last time update ran
 */
let lastRun = 0;

/**
 * notifies on all accumulated updates
 * then calls it self after a timed delay (setTimeout)
 */
function update(): void {
  const now = Date.now();
  lastRun = now;
  if (nextRun.on <= now) {
    nextRun.handle = null;
  }
  buffer.forEach((updates, state) => {
    const registrations = getRegistrations(state);
    buffer.delete(state);

    for (let j = 0; j < updates.length; j++) {
      const update = updates[j];
      for (let i = 0; i < registrations.length; i++) {
        const cb = registrations[i];
        if (cb) {
          cb(update[0], update[1]);
        }
      }
    }
  });
}

/**
 * adds updates to an notify buffer, the buffer gets notified between min-max sleep time
 * @param type what to do with old updates if this is not the first update (between notification runs)
 * @deprecated will be modified in the next minor version
 * the functionality will be available through `lock` and `bobble` upcoming features
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
  const next = (lastRun + gap) - now;

  if (next <= 0) {
    update();
  } else if (!nextRun.handle || nextRun.on > (now + next)) {
    if (nextRun.handle) {
      clearTimeout(nextRun.handle);
    }
    nextRun.handle = setTimeout(update, next);
    nextRun.on = now + next;
  }
}

/**
 * set the gap between updates
 * if updates are scheduled in the future later then gap
 * they'll get predated
 * @param ms
 * @since 0.0.4
 * @deprecated may be modified/removed in the next minor version
 * the functionality will be available through `lock`s and `bobble`s
 */
export function setUpdateGap(ms: number) {
  if (!(ms > 0 && ms <= Number.MAX_SAFE_INTEGER)) {
    throw new TypeError('number must be a positive int')
  }
  const prev = gap;
  gap = ms;

  if (gap < prev && nextRun.handle) {
    const now = Date.now();
    clearTimeout(nextRun.handle);
    nextRun.handle = setTimeout(update, gap);
    nextRun.on = now + gap;
  }
}
