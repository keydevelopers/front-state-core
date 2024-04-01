import { describe, it } from "testing/bdd.ts";
import notify from "./dirty-loop.ts";
import { UpdateType } from "./update-type.ts";
import {
  createRegistration,
  createState,
  globalContext,
  removeState,
} from "../mod.ts";
import { assertSpyCallArgs, assertSpyCalls, spy } from "testing/mock.ts";

describe("dirty loop state update manger", () => {
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
  it("overrides updates (skips updates)", async () => {
    const state = createState(globalContext);
    const callback = spy();
    notify(state, 99, 100, UpdateType.override);
    createRegistration(callback, state, globalContext);
    const updates = [
      [0, 1],
      [1, 2],
    ];
    updates.forEach((update) => {
      notify(state, update[0], update[1], UpdateType.override);
    });
    await new Promise((resolve) => setTimeout(resolve, 80));
  
    // expected to skip one update
    assertSpyCalls(callback, 1);
    assertSpyCallArgs(callback, 0, updates[1]);
  
    removeState(state);
  });
  
  it("keeps update order", async () => {
    const state = createState(globalContext);
    const callback = spy();
    notify(state, 99, 100, UpdateType.override);
    await new Promise((resolve) => setTimeout(resolve, 200));
    createRegistration(callback, state, globalContext);
    const updates = [
      [0, 1],
      [1, 2],
    ];
    updates.forEach((update) => {
      notify(state, update[0], update[1], UpdateType.oldestFirst);
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    assertSpyCalls(callback, 2);
    updates.map((update, index) => {
      assertSpyCallArgs(callback, index, update);
    });
    removeState(state);
  });
  
  it("inverts update order", async () => {
    const state = createState(globalContext);
    const callback = spy();
    notify(state, 99, 100, UpdateType.newestFirst);
    createRegistration(callback, state, globalContext);
    const updates = [
      [0, 1],
      [1, 2],
    ];
  
  
    updates.forEach((update) => {
      notify(state, update[0], update[1], UpdateType.newestFirst);
    });
  
    await new Promise((resolve) => setTimeout(resolve, 200));
  
    assertSpyCalls(callback, 2);
  
    updates.toReversed().map((update, index) => {
      assertSpyCallArgs(callback, index, update);
    });
    removeState(state);
  });
  
  it("doesn't update twice", async () => {
    const state = createState(globalContext);
    const callback = spy();
    notify(state, 99, 100, UpdateType.override);
    createRegistration(callback, state, globalContext);
    const updates = [
      [0, 1],
      [1, 2],
    ];
  
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      notify(state, update[0], update[1], UpdateType.override);
      await new Promise((res) => setTimeout(res, 200));
    }
  
    assertSpyCalls(callback, 2);
    updates.forEach((update, i) => {
      assertSpyCallArgs(callback, i, update);
    });
  
    await new Promise((res) => setTimeout(res, 500));
  
    assertSpyCalls(callback, 2);
    updates.forEach((update, i) => {
      assertSpyCallArgs(callback, i, update);
    });
  
    removeState(state);
  });
})


describe.skip("set gap", () => {
})