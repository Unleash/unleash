export interface Mapper<PUBLIC, INTERNAL, I = Partial<PUBLIC>> {
    fromPublic(input: PUBLIC): INTERNAL;
    toPublic(input: INTERNAL): PUBLIC;
    mapInput?(input: I): INTERNAL;
}
