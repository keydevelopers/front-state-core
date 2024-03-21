import { createRegistration, getRegistrations, createState as createStateInContext, removeRegistration, getRegistry, Context, createCleanup } from "./context.ts"
import { globalContext } from "./globalContext.ts"
import dirtyNotifier,{ UpdateType } from './dirty-loop.ts'
import { Listener } from "type"

let context = globalContext

type StateCore<T> = {
    watch: (callback: Listener<T>) => void;
    notify: (oldValue: T, newValue: T) => void;
    notifyDirty: (value: T, oldValue: T, type?: UpdateType | undefined) => void;
    unWatch: (callback: Listener<T>) => void;
    cleanup: (cleanup: VoidFunction) => void
}

export default function createState<T>(): StateCore<T> {
    const state = createStateInContext(context)

    function watch(callback: Listener<T>) {
        createRegistration(callback, state, context)
    }


    const notifyDirty = dirtyNotifier.bind(null, state)
    function notify(oldValue: T, newValue: T) {
        const listeners = getRegistrations(state)
        for (const listener of listeners) {
            if (!listener) {
                continue
            }
            (listener as Listener<T>)(newValue, oldValue)
        }
    }

    function cleanup(cleanup: VoidFunction) {
        createCleanup(cleanup, state, context)
    }

    function unWatch(callback: Listener<T>) {
        const registry = getRegistry(state, callback)
        if (registry) {
            removeRegistration(registry)
            state.registrations.delete(registry)
            state.context.registrations.delete(registry)
            context.registrations.delete(registry)
        }
    }

    return { watch, notify, notifyDirty, unWatch, cleanup }
}

export function setContext(contextToSet: Context): Context {
    return context = contextToSet
}
