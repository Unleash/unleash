import { ISignal, SignalSource } from './signal';
import { IConstraint } from './strategy';

type ActionSetState = 'started' | 'success' | 'failed';

type ActionState = ActionSetState | 'not started';

export interface IActionSet {
    id: number;
    enabled: boolean;
    name: string;
    description: string;
    project: string;
    actorId: number;
    match: IMatch;
    actions: IAction[];
    createdAt: string;
    createdByUserId: number;
}

export type ParameterMatch = Pick<
    IConstraint,
    'inverted' | 'operator' | 'caseInsensitive' | 'value' | 'values'
>;

export interface IMatch {
    source: SignalSource;
    sourceId: number;
    payload: Record<string, ParameterMatch>;
}

export interface IAction {
    id: number;
    action: string;
    sortOrder: number;
    executionParams: Record<string, unknown>;
    createdAt: string;
    createdByUserId: number;
}

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
    signalId: number;
    createdAt: string;
    state: ActionSetState;
    signal: ISignal;
    actionSet: IActionSetEventActionSet;
}
