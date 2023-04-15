export type OpResult<T> = Promise<
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error | unknown;
    }
>;
