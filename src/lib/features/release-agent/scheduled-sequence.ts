export type ScheduledSequenceStatus =
    | 'active'
    | 'cancelled'
    | 'completed'
    | 'conflicted';

export interface ScheduledSequence {
    id: string;
    project: string;
    environment: string;
    createdByUserId: number | null;
    createdAt: Date;
    prompt: string | null;
    model: string | null;
    agentVersion: string | null;
    status: ScheduledSequenceStatus;
}

export type ScheduledSequenceWriteModel = Omit<
    ScheduledSequence,
    'createdAt' | 'status'
> & {
    status?: ScheduledSequenceStatus;
};
