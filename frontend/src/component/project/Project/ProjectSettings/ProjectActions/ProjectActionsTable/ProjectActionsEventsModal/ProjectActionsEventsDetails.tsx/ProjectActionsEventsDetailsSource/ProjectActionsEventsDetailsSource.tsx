import { IObservableEvent } from 'interfaces/action';
import { ProjectActionsEventsDetailsSourceIncomingWebhook } from './ProjectActionsEventsDetailsSourceIncomingWebhook';

interface IProjectActionsEventsDetailsSourceProps {
    observableEvent: IObservableEvent;
}

export const ProjectActionsEventsDetailsSource = ({
    observableEvent,
}: IProjectActionsEventsDetailsSourceProps) => {
    const { source } = observableEvent;

    if (source === 'incoming-webhook') {
        return (
            <ProjectActionsEventsDetailsSourceIncomingWebhook
                observableEvent={observableEvent}
            />
        );
    }

    return null;
};
