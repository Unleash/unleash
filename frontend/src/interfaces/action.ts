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

export type ObservableEventSource = 'incoming-webhook';

interface IObservableEvent {
    id: number;
    source: ObservableEventSource;
    sourceId: number;
    createdAt: string;
    createdByIncomingWebhookTokenId: number;
    payload: Record<string, unknown>;
}

type ActionSetState = 'started' | 'success' | 'failed';

type ActionState = ActionSetState | 'not started';

export interface IActionEvent extends IAction {
    state: ActionState;
    details?: string;
}

interface IActionSetEventActionSet extends IActionSet {
    actions: IActionEvent[];
}

export interface IActionSetEvent {
    id: number;
    actionSetId: number;
    observableEventId: number;
    createdAt: string;
    state: ActionSetState;
    observableEvent: IObservableEvent;
    actionSet: IActionSetEventActionSet;
}
