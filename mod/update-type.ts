/**
 * how to apply the current update on the previous updates
 */
export enum UpdateType {
  /** replace all updates with the current (default for UI)*/
  override,
  /** apply newer updates first */
  newestFirst,
  /** apply older updates first (normal behavior) */
  oldestFirst,
}
