export interface Mapper<INPUT, OUTPUT> {
    map(input: INPUT): OUTPUT;
}
