import { describe, it } from "testing/bdd.ts";
import { assert, assertEquals } from "assert";
import {
  Context,
  createContext,
  createRegistration,
  createState,
} from "../mod/context.ts";

describe("create context", () => {
  const parent: Context = {
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController(),
  };
  it("creates a context and adds it to the parent context", () => {
    const context = createContext(parent);
    assertEquals(context, {
      states: new Set(),
      registrations: new Set(),
      cleanup: new Set(),
      contexts: new Set(),
      controller: new AbortController(),
    });
    assert(parent.contexts.has(context));
  });
});

describe("create state", () => {
  const context: Context = {
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController(),
  };
  it("creates a state", () => {
    const state = createState(context);
    assertEquals(state, {
      registrations: new Set(),
      cleanup: new Set(),
      context,
    });
    assert(context.states.has(state));
  });
});

describe("create registration", () => {
  const globalContext = createContext({
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController(),
  });
  const localContext = createContext(globalContext);
  const globalState = createState(globalContext);
  const localState = createState(localContext);

  it("registers in the state context", () => {
    function registration() {}
    const id = createRegistration(registration, globalState, globalContext);
    assert(globalContext.registrations.has(id) === true);
    assert(globalState.registrations.has(id) === true);
    assert(localContext.registrations.has(id) === false);
    assert(localState.registrations.has(id) === false);
  });

  it("registers in the local context", () => {
    function localRegistration() {}
    const id = createRegistration(localRegistration, globalState, localContext);

    assert(localContext.registrations.has(id) === true);
    assert(globalState.registrations.has(id) === true);
    assert(localState.registrations.has(id) === false);
    assert(globalContext.registrations.has(id) === false);
  });

  it("registers in the local state", () => {
    function localRegistration() {}
    const id = createRegistration(localRegistration, localState, globalContext);

    assert(localContext.registrations.has(id) === false);
    assert(localState.registrations.has(id) === true);
    assert(globalState.registrations.has(id) === false);
    assert(globalContext.registrations.has(id) === true);
  });

  it("registers local in local state", () => {
    function localRegistration() {}
    const id = createRegistration(localRegistration, localState, localContext);

    assert(localContext.registrations.has(id) === true);
    assert(localState.registrations.has(id) === true);
    assert(globalState.registrations.has(id) === false);
    assert(globalContext.registrations.has(id) === false);
  });
});