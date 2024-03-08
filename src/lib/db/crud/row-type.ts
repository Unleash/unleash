// This defines dynamic name for the generated types
type CamelCaseToSnakeCase<S extends string> = S extends `${infer P1}${infer P2}`
    ? P2 extends Uncapitalize<P2>
        ? `${P1}${CamelCaseToSnakeCase<P2>}`
        : `${P1}_${CamelCaseToSnakeCase<Uncapitalize<P2>>}`
    : S;

/**
 * This helper type turns all fields in the type from camelCase to snake_case
 */
export type Row<T> = {
    [K in keyof T as CamelCaseToSnakeCase<K & string>]: T[K];
};
