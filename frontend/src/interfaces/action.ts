export interface IActionSet {
    id: number;
    enabled: boolean;
    name: string;
    project: string;
    actorId: number;
    match: IMatch;
    actions: IAction[];
    createdAt: string;
    createdByUserId: number;
}

type MatchSource = 'incoming-webhook';

export interface IMatch {
    source: MatchSource;
    sourceId: number;
    payload: Record<string, unknown>;
}

export interface IAction {
    id: number;
    action: string;
    sortOrder: number;
    executionParams: Record<string, unknown>;
    createdAt: string;
    createdByUserId: number;
}
