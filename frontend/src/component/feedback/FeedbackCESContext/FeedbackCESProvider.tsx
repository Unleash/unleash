import React, {
    useState,
    ReactNode,
    useMemo,
    useCallback,
    useEffect,
} from 'react';
import { FeedbackCES } from 'component/feedback/FeedbackCES/FeedbackCES';
import {
    feedbackCESContext,
    ShowFeedbackCES,
    IFeedbackCESContext,
    IFeedbackCESState,
} from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { useFeedbackCESSeen } from 'component/feedback/FeedbackCESContext/useFeedbackCESSeen';
import { useFeedbackCESEnabled } from 'component/feedback/FeedbackCESContext/useFeedbackCESEnabled';

interface IFeedbackProviderProps {
    children: ReactNode;
}

export const FeedbackCESProvider = ({ children }: IFeedbackProviderProps) => {
    const [state, setState] = useState<IFeedbackCESState>();
    const { isSeen, setSeen } = useFeedbackCESSeen();
    const enabled = useFeedbackCESEnabled();

    useEffect(() => {
        state && setSeen(state);
    }, [state, setSeen]);

    // Set a new feedback state iff the path is unseen and CES is enabled.
    const showFeedbackCES: ShowFeedbackCES = useCallback(
        value => {
            setState(prev => {
                const next = value instanceof Function ? value(prev) : value;
                return !enabled || !next || isSeen(next) ? undefined : next;
            });
        },
        [enabled, isSeen]
    );

    const hideFeedbackCES = useCallback(() => {
        setState(undefined);
    }, [setState]);

    const value: IFeedbackCESContext = useMemo(
        () => ({
            showFeedbackCES: showFeedbackCES,
            hideFeedbackCES: hideFeedbackCES,
        }),
        [showFeedbackCES, hideFeedbackCES]
    );

    return (
        <feedbackCESContext.Provider value={value}>
            {children}
            <FeedbackCES state={state} />
        </feedbackCESContext.Provider>
    );
};
