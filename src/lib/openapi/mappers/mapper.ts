export interface Mapper<T, S, I = Partial<T>> {
    map(input: T): S;
    inverseMap(input: S): T;
    mapInput(input: I): S;
}
