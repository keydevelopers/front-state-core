import { counter } from "../utils/counter.ts";

const states = new Set<State>();
const registrations = new Map<number, Function>();
const cleanup = new Map<number, VoidFunction>();
const contexts = new Set<Context>();

export type Context = {
  readonly states: Set<State>;
  readonly registrations: Set<number>;
  readonly cleanup: Set<number>;
  readonly contexts: Set<Context>;
  readonly controller: AbortController;
};

export type State = {
  readonly registrations: Set<number>;
  readonly cleanup: Set<number>;
  readonly context: Context;
};

const registrationIds = counter(0);
const cleanupIds = counter(0);

/**
 * registers a function that will be called when the context/state is destroyed
 */
export function createCleanup(
  cleanupCallback: VoidFunction,
  state: State,
  context: Context,
): number {
  const id = cleanupIds.next().value!;
  context.cleanup.add(id);
  state.cleanup.add(id);
  cleanup.set(id, cleanupCallback);
  return id;
}

/**
 * creates a state under a context
 */
export function createState(context: Context): State {
  const state: State = {
    registrations: new Set(),
    cleanup: new Set(),
    context,
  };
  context.states.add(state);
  states.add(state);
  return state;
}

/**
 * if the state or the context gets removed the the registration will also be removed
 */
export function createRegistration(
  registration: Function,
  state: State,
  context: Context,
): number {
  const id = registrationIds.next().value!;
  context.registrations.add(id);
  state.registrations.add(id);
  registrations.set(id, registration);
  return id;
}

/**
 * creates a sub-context
 */
export function createContext(parent: Context): Context {
  const context: Context = {
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController(),
  };
  parent.contexts.add(context);
  contexts.add(context);
  return context;
}

/**
 * gets all registrations for the state
 */
export function getRegistrations(state: State): (Function | undefined)[] {
  return [...state.registrations.keys()].map(registrations.get, registrations);
}

/**
 * get the registration id for a function
 */
export function getRegistry(
  state: State,
  registration: Function,
): number | undefined {
  for (const id of state.registrations) {
    const registry = registrations.get(id);
    if (registration === registry) {
      return id;
    }
  }
}

/**
 * gets all cleanup for the state
 */
export function getCleanup(state: State): (VoidFunction | undefined)[] {
  return [...state.cleanup.keys()].map(cleanup.get, cleanup);
}

export function removeRegistration(id: number): boolean {
  return registrations.delete(id);
}
/**
 * @returns the cleanup
 */
export function removeCleanup(id: number): VoidFunction | undefined {
  const callback = cleanup.get(id);
  cleanup.delete(id);
  return callback;
}

/**
 * will call the cleanup functions on the state
 */
export function removeState(state: State): void {
  state.cleanup.forEach((id) => removeCleanup(id)?.());
  state.registrations.forEach(removeRegistration);
  states.delete(state);
}

/**
 * will call the cleanup functions on the state
 */
export function removeContext(context: Context): void {
  context.registrations.forEach(removeRegistration);
  context.cleanup.forEach((id) => removeCleanup(id)?.());
  context.contexts.forEach(removeContext);
  context.states.forEach(removeState);
  contexts.delete(context);
  context.controller.abort();
}

export function isEmptyContext(context: Context): boolean {
  return !context.contexts.size &&
    !context.states.size &&
    !context.registrations.size &&
    !context.cleanup.size &&
    !context.controller.signal.aborted;
}
