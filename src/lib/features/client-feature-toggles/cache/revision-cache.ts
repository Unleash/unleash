import { Revision } from "./client-feature-toggle-cache";

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

	private changeBase(): void {
		if (!(this.cache.length >= 2)) return;
		const base = this.cache[0];
		const newBase = this.cache[1];

		const mergeWithoutDuplicates = (arr1: any[], arr2: any[]) => {
			const map = new Map();
			arr1.concat(arr2).forEach((item) => {
				map.set(item.name, item);
			});
			return Array.from(map.values());
		};

		newBase.removed = mergeWithoutDuplicates(base.removed, newBase.removed);
		newBase.updated = mergeWithoutDuplicates(base.updated, newBase.updated);

		this.cache = [newBase, ...this.cache.slice(2)];
	}
}
