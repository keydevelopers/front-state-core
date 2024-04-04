import { describe, it } from "testing/bdd.ts";
import { assert, assertEquals } from "assert";
import { getContext, globalContext, setContext } from "./current-context.ts";
import { createContext } from "./context.ts";

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
    assert(context === getContext());
  });
});
