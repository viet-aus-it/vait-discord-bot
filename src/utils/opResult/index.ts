export type OpResult<T = unknown, E = Error | unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

export type OpPromise<T = unknown, E = Error | unknown> = Promise<
  OpResult<T, E>
>;
