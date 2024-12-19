import type { Revision } from './client-feature-toggle-delta';

const mergeWithoutDuplicates = (arr1: any[], arr2: any[]) => {
    const map = new Map();
    arr1.concat(arr2).forEach((item) => {
        map.set(item.name, item);
    });
    return Array.from(map.values());
};

export class RevisionDelta {
    private delta: Revision[];
    private maxLength: number;

    constructor(data: Revision[] = [], maxLength: number = 20) {
        this.delta = data;
        this.maxLength = maxLength;
    }

    public addRevision(revision: Revision): void {
        if (this.delta.length >= this.maxLength) {
            this.changeBase();
        }

        this.delta = [...this.delta, revision];
    }

    public getRevisions(): Revision[] {
        return this.delta;
    }

    public hasRevision(revisionId: number): boolean {
        return this.delta.some(
            (revision) => revision.revisionId === revisionId,
        );
    }

    private changeBase(): void {
        if (!(this.delta.length >= 2)) return;
        const base = this.delta[0];
        const newBase = this.delta[1];

        newBase.removed = mergeWithoutDuplicates(base.removed, newBase.removed);
        newBase.updated = mergeWithoutDuplicates(base.updated, newBase.updated);

        this.delta = [newBase, ...this.delta.slice(2)];
    }
}
