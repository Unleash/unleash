export interface IUniqueConnectionReadModel {
    getStats(): Promise<{ previous: number; current: number }>;
}
