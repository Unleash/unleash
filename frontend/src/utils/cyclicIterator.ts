export class CyclicIterator<T> {
    private current = 0;
    readonly all: T[];
    constructor(defaultList: T[]) {
        this.all = defaultList;
    }
    next(): T {
        const item = this.all[this.current];
        this.current = (this.current + 1) % this.all.length;
        return item;
    }
}
