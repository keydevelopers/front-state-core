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
  controller: new AbortController(),
};

/**
 * the context that should be used when registering states and listeners
 * so if the context is removed we can remove all the registration associated with it
 * can be set by calling @link setContext
 */
let context = globalContext;

/**
 * sets @see context to context that should be used when registering states and listeners
 * so if the context is removed we can remove all the registration associated with it
 */
export function setContext(contextToSet: Context): Context {
  return context = contextToSet;
}

/**
 * use to get the current context states should be created in that context
 * @returns the @see context
 */
export function getContext(): Context {
  return context;
}
