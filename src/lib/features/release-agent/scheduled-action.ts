export type ScheduledActionStatus =
    | 'pending'
    | 'executed'
    | 'failed'
    | 'skipped';

export type StrategyCreatePayload = {
    strategyName: string;
    parameters?: Record<string, unknown>;
    constraints?: unknown[];
    variants?: unknown[];
    segments?: number[];
    title?: string;
    disabled?: boolean;
    sortOrder?: number;
};

export type StrategyUpdatePayload = {
    strategyRef:
        | { type: 'owned'; sortOrder: number }
        | { type: 'id'; id: string };
    patch: Partial<Omit<StrategyCreatePayload, 'strategyName'>>;
};

export type StrategyDeletePayload = {
    strategyRef:
        | { type: 'owned'; sortOrder: number }
        | { type: 'id'; id: string };
};

export type FeatureEnvironmentSetEnabledPayload = {
    enabled: boolean;
};

export type McpInvokePayload = {
    server: string;
    tool: string;
    arguments: Record<string, unknown>;
    response?: unknown;
};

export type ScheduledAction =
    | ScheduledActionBase<'strategy.create', StrategyCreatePayload>
    | ScheduledActionBase<'strategy.update', StrategyUpdatePayload>
    | ScheduledActionBase<'strategy.delete', StrategyDeletePayload>
    | ScheduledActionBase<
          'feature_environment.setEnabled',
          FeatureEnvironmentSetEnabledPayload
      >
    | ScheduledActionBase<'mcp.invoke', McpInvokePayload>;

interface ScheduledActionBase<TType extends string, TPayload> {
    id: string;
    sequenceId: string;
    featureName: string;
    fireAt: Date;
    actionType: TType;
    payload: TPayload;
    ownedStrategyId: string | null;
    status: ScheduledActionStatus;
    executedAt: Date | null;
    error: string | null;
    sortOrder: number;
}

export type ScheduledActionWriteModel = Omit<
    ScheduledAction,
    'status' | 'executedAt' | 'error' | 'ownedStrategyId'
> & {
    status?: ScheduledActionStatus;
    executedAt?: Date | null;
    error?: string | null;
    ownedStrategyId?: string | null;
};
