export { default as stateCore, setContext } from "./mod/state-core.ts";
export {
  createCleanup,
  createContext,
  createRegistration,
  createState,
  getCleanup,
  getRegistrations,
  getRegistry,
  isEmptyContext,
  removeCleanup,
  removeContext,
  removeRegistration,
  removeState,
  type Context,
  type State
} from "./mod/context.ts";
export { UpdateType } from './mod/update-type.ts'
export { default as notify, setUpdateGap } from './mod/dirty-loop.ts'
export { globalContext } from "./mod/globalContext.ts";