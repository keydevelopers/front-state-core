import { Context } from "./context.ts";

/**
 * this is the default context
 * set it back after switching contexts
 */
export const globalContext: Context = {
    states: new Set(),
    registrations: new Set(),
    cleanup: new Set(),
    contexts: new Set(),
    controller: new AbortController()
};