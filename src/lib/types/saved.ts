// Add an id field to an object.
export type Saved<T extends {}, Id extends string | number = string> = T & {
    id: Id;
};

// Remove an id field from an object.
export type Unsaved<T extends {}> = Omit<T, 'id'>;
