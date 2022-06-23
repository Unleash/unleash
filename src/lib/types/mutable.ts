// Recursively remove readonly modifiers from properties.
export type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};

// Recursively add readonly modifiers to properties.
export type DeepImmutable<T> = {
    readonly [P in keyof T]: DeepImmutable<T[P]>;
};
