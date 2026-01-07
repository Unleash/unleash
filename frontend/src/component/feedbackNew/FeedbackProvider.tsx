import { FeedbackComponentWrapper } from './FeedbackComponent.tsx';
import {
    FeedbackContext,
    type FeedbackData,
    type FeedbackMode,
} from './FeedbackContext.ts';
import { type FC, useState } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const FeedbackProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const [feedbackData, setFeedbackData] = useState<
        FeedbackData | undefined
    >();
    const { trackEvent } = usePlausibleTracker();

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMode, setFeedbackMode] = useState<
        FeedbackMode | undefined
    >();
    const openFeedback = (
        data: FeedbackData,
        mode: FeedbackMode,
        variant: string = '',
    ) => {
        setFeedbackData(data);
        setShowFeedback(true);
        setFeedbackMode(mode);

        trackEvent('feedback', {
            props: {
                eventType: `feedback opened - ${data.category}`,
                category: data.category,
                variant: variant,
            },
        });
    };

    const closeFeedback = () => {
        trackEvent('feedback', {
            props: {
                eventType: `feedback closed - ${feedbackData?.category}`,
                category: feedbackData?.category || 'unknown',
            },
        });
        setFeedbackData(undefined);
        setShowFeedback(false);
    };

    return (
        <FeedbackContext.Provider
            value={{
                feedbackData,
                openFeedback,
                closeFeedback,
                showFeedback,
                setShowFeedback,
                feedbackMode,
            }}
        >
            {children}
            <FeedbackComponentWrapper />
        </FeedbackContext.Provider>
    );
};
