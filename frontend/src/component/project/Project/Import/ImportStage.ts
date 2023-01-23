export type ImportStage =
    | { name: 'configure' }
    | { name: 'validate'; environment: string; payload: string }
    | { name: 'import' };
