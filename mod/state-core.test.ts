import { describe, it } from "testing/bdd.ts";
import stateCore, { setContext } from "./state-core.ts";
import { createContext, getRegistry } from "./context.ts";
import { assertSpyCallArgs, assertSpyCalls, spy } from "testing/mock.ts";
import { assert, assertEquals } from "assert";
import { globalContext } from "./globalContext.ts";

describe("state core", { sanitizeOps: false, sanitizeResources: false }, () => {
  const initialStates = new Set(globalContext.states);
  const { notify, notifyDirty, cleanup, unWatch, watch } = stateCore<
    number
  >();

  const state = Array.from(globalContext.states).filter((state) =>
    !initialStates.has(state)
  )[0];
  assertEquals(state, {
    cleanup: new Set(),
    context: globalContext,
    registrations: new Set(),
  });

  it("registers a listener", () => {
    const listener = () => {};
    watch(listener);
    const id = getRegistry(state, listener);

    assert(typeof id === "number");
    assert(globalContext.registrations.has(id));
    assert(state.registrations.has(id));
  });

  it("un-registers a listener", () => {
    const listener = () => {};
    watch(listener);

    const id = getRegistry(state, listener);
    assert(typeof id === "number");

    unWatch(listener);

    assert(!globalContext.registrations.has(id));
    assert(!state.registrations.has(id));
    assertEquals(getRegistry(state, listener), undefined);
  });

  it("notifies listeners", () => {
    const listener = spy();
    watch(listener);

    notify(0, 1);

    assertSpyCalls(listener, 1);
    assertSpyCallArgs(listener, 0, [1, 0]);
  });

  it("notifies listeners dirty", {
    sanitizeOps: false,
    sanitizeResources: false,
  }, () => {
    const listener = spy();
    watch(listener);

    notifyDirty(1, 0);

    assertSpyCalls(listener, 1);
    assertSpyCallArgs(listener, 0, [1, 0]);
  });

  it("registers a cleanup", () => {
    const initialCleanup = new Set(state.cleanup);
    const cleanupListener = () => {};
    cleanup(cleanupListener);
    const id = Array.from(state.cleanup).filter((id) =>
      !initialCleanup.has(id)
    ).at(0);

    console.log(id);
    assert(typeof id === "number");
    assert(globalContext.cleanup.has(id));
    assert(state.cleanup.has(id));
  });
});

describe("set context", () => {
  it("sets the context to context", () => {
    const context = setContext(createContext(globalContext));
    assertEquals(context, {
      cleanup: new Set(),
      contexts: new Set(),
      controller: new AbortController(),
      registrations: new Set(),
      states: new Set(),
    });
  });
  it("uses context to register listeners", () => {
    const context = setContext(createContext(globalContext));
    const state = stateCore();

    assertEquals(context.states.size, 1);
    assertEquals(context.registrations.size, 0);

    const watch = () => {};

    state.watch(watch);
    assertEquals(context.registrations.size, 1);

    state.unWatch(watch);
    assertEquals(context.registrations.size, 0);

    state.cleanup(() => {});
    assertEquals(context.cleanup.size, 1);
  });
});