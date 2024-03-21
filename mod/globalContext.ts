import { Context } from "./context.ts";

export const globalContext: Context = {
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController()
};