import type { ISignal } from 'interfaces/signal';
import { ProjectActionsEventsDetailsSourceSignalEndpoint } from './ProjectActionsEventsDetailsSourceSignalEndpoint';

interface IProjectActionsEventsDetailsSourceProps {
    signal: ISignal;
}

export const ProjectActionsEventsDetailsSource = ({
    signal,
}: IProjectActionsEventsDetailsSourceProps) => {
    const { source } = signal;

    if (source === 'signal-endpoint') {
        return (
            <ProjectActionsEventsDetailsSourceSignalEndpoint signal={signal} />
        );
    }

    return null;
};
