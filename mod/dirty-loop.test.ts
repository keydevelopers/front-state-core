import { describe, it } from "testing/bdd.ts";
import notify, { UpdateType } from "./dirty-loop.ts";
import {
  createRegistration,
  createState,
  globalContext,
  removeState,
} from "../mod.ts";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  spy,
} from "testing/mock.ts";

describe("dirty loop state update manger", { sanitizeResources: false, sanitizeOps: false }, () => {
  it("notifies the registrations", () => {
    const state = createState(globalContext);
    const callbacks = Array(10).fill(0).map(() => {
      const callback = spy();
      createRegistration(callback, state, globalContext);
      return callback;
    });
    notify(state, 0, 1, UpdateType.override);
    callbacks.forEach((callback) => {
      assertSpyCalls(callback, 1);
    });
    removeState(state);
  });

  it("keeps update order", () => {
    const state = createState(globalContext);
    const callback = spy();
    createRegistration(callback, state, globalContext);
    const updates = [
      [0, 1],
      [1, 2],
    ];
    updates.forEach((update) => {
      notify(state, update[0], update[1], UpdateType.override);
    });
    assertSpyCalls(callback, 2);
    updates.map((update, index) => {
        assertSpyCallArgs(callback, index, update);
    })
    removeState(state);
  });
});
