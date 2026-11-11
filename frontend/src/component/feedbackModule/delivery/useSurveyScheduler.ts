import { useEffect, useState } from 'react';
import type { Survey } from '../survey.ts';
import { matchTriggers } from '../triggers/matchTriggers.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';

type SchedulerState =
    | { status: 'idle' }
    | { status: 'waiting'; survey: Survey }
    | { status: 'shown'; survey: Survey };

interface SurveyScheduler {
    shown: Survey | null;
    process: (event: TriggerEvent) => void;
    dismiss: () => void;
}

const idle: SchedulerState = { status: 'idle' };

export const useSurveyScheduler = (
    surveys: Survey[],
    canShowSurvey: (flagName: string) => boolean,
): SurveyScheduler => {
    const [state, setState] = useState<SchedulerState>(idle);

    useEffect(() => {
        if (state.status !== 'waiting') {
            return;
        }
        const { survey } = state;
        const timer = setTimeout(
            () => setState({ status: 'shown', survey }),
            survey.trigger.delayMs ?? 0,
        );
        return () => clearTimeout(timer);
    }, [state]);

    const process = (event: TriggerEvent) => {
        const survey = matchTriggers(event, surveys).find(({ flagName }) =>
            canShowSurvey(flagName),
        );
        if (survey === undefined) {
            return;
        }
        setState((current) =>
            current.status === 'idle' ? { status: 'waiting', survey } : current,
        );
    };

    const dismiss = () => setState(idle);

    return {
        shown: state.status === 'shown' ? state.survey : null,
        process,
        dismiss,
    };
};
