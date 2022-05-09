export interface IPolicy<TTarget, TResult> {
  applyTo(data: TTarget): Promise<TResult | null>;
}
