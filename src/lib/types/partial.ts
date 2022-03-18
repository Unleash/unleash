// Recursively mark all properties as optional.
export type PartialDeep<T> = T extends object
    ? {
          [P in keyof T]?: PartialDeep<T[P]>;
      }
    : T;

// Mark one or more properties as optional.
export type PartialSome<T, K extends keyof T> = Pick<Partial<T>, K> &
    Omit<T, K>;
