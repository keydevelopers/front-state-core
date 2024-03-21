import { describe, it } from "testing/bdd.ts";
import { assert, assertThrows } from "assert";

import { counter } from "./counter.ts";

describe("counter", () => {
  it("throws when reaching max safe int", () => {
    const count = counter(Number.MAX_SAFE_INTEGER);
    assertThrows(count.next, TypeError);
  });

  it("increases by only one at a time", () => {
    const counters = [
      counter(0),
      counter(50),
      counter(2 ** 8),
      counter(342),
    ];
    for (const counter of counters) {
      let count = counter.next().value!;
      for (let i = 0; i < 10; i++) {
        const next = counter.next().value!;
        assert((next - 1) === count);
        count = next;
      }
    }
  });

  it("counts from the number specified", () => {
    const counters = [
      0,
      50,
      2 ** 8,
      342,
    ];
    for (const start of counters) {
      const count = counter(start).next().value;
      assert(count === start);
    }
  });
});
