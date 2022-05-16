// Create a string with allowed values from a values array. ['A', 'B'] => 'A' | 'B'
export type AllowedStrings<T extends ReadonlyArray<unknown>> =
    // eslint-disable-next-line @typescript-eslint/no-shadow
    T extends ReadonlyArray<infer AllowedStrings> ? AllowedStrings : never;
