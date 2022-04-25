// Remove readonly modifiers from properties.
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

// Recursively remove readonly modifiers from properties.
export type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};
