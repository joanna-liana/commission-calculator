export interface IPolicy<TTarget, TResult> {
  applyTo(data: TTarget): Promise<TResult | null>;
}

export interface IDefaultPolicy<TTarget, TResult> {
  applyTo(data: TTarget): Promise<TResult>;
}
