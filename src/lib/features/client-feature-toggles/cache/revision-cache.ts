import { Revision } from "./client-feature-toggle-cache";

const mergeWithoutDuplicates = (arr1: any[], arr2: any[]) => {
	const map = new Map();
	arr1.concat(arr2).forEach((item) => {
		map.set(item.name, item);
	});
	return Array.from(map.values());
};

export class RevisionCache {
	private cache: Revision[];
	private maxLength: number;

	constructor(data: Revision[] = [], maxLength: number = 100) {
		this.cache = data;
		this.maxLength = maxLength;
	}

	public addRevision(revision: Revision): void {
		if (this.cache.length >= this.maxLength) {
			this.changeBase();
		}

		this.cache = [...this.cache, revision];
	}

	public getRevisions(): Revision[] {
		return this.cache;
	}

	public hasRevision(revisionId: number): boolean {
		return this.cache.some((revision) => revision.revisionId === revisionId);
	}

	private changeBase(): void {
		if (!(this.cache.length >= 2)) return;
		const base = this.cache[0];
		const newBase = this.cache[1];

		newBase.removed = mergeWithoutDuplicates(base.removed, newBase.removed);
		newBase.updated = mergeWithoutDuplicates(base.updated, newBase.updated);

		this.cache = [newBase, ...this.cache.slice(2)];
	}
}
