import {
  createCleanup,
  createRegistration,
  createState as createStateInContext,
  getRegistrations,
  getRegistry,
  removeRegistration,
  State,
} from "./context.ts";
import { getContext } from "./current-context.ts";
import dirtyNotifier from "./dirty-loop.ts";
import { UpdateType } from "./update-type.ts";
import { Listener } from "type";

/**
 * listeners will be called when calling @link notify or @link notifyDirty
 */
type StateCore<T> = {
  /**
   * listen to updates by registering a callback
   */
  watch: (callback: Listener<T>) => void;
  notify: (oldValue: T, newValue: T) => void;
  notifyDirty: (value: T, oldValue: T, type?: UpdateType | undefined) => void;
  unWatch: (callback: Listener<T>) => void;
  cleanup: (cleanup: VoidFunction) => void;
  readonly state: State;
};

/**
 * abstraction over the low level api
 * it takes care of registering state, listeners in the current context @link context and calling listeners on updates
 */
export default function createState<T>(): StateCore<T> {
  const context = getContext();
  const state = createStateInContext(context);

  function watch(callback: Listener<T>) {
    const context = getContext();
    createRegistration(callback, state, context);
  }

  const notifyDirty = dirtyNotifier.bind(null, state);
  function notify(oldValue: T, newValue: T) {
    const listeners = getRegistrations(state);
    for (const listener of listeners) {
      if (!listener) {
        continue;
      }
      (listener as Listener<T>)(newValue, oldValue);
    }
  }

  function cleanup(cleanup: VoidFunction) {
    const context = getContext();
    createCleanup(cleanup, state, context);
  }

  function unWatch(callback: Listener<T>) {
    const registry = getRegistry(state, callback);
    if (registry) {
      removeRegistration(registry);
      state.registrations.delete(registry);
      state.context.registrations.delete(registry);
      context.registrations.delete(registry);
    }
  }

  return { watch, notify, notifyDirty, unWatch, cleanup, state };
}
