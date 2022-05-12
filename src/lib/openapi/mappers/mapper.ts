export interface Mapper<T, S, I extends Partial<T>> {
    map(input: T): S;
    inverseMap(input: S): T;
    mapInput(input: I): S;
}
