import { FeedbackComponentWrapper } from './FeedbackComponent';
import { FeedbackContext, FeedbackData, FeedbackMode } from './FeedbackContext';
import { FC, useState } from 'react';

export const FeedbackProvider: FC = ({ children }) => {
    const [feedbackData, setFeedbackData] = useState<
        FeedbackData | undefined
    >();

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMode, setFeedbackMode] = useState<
        FeedbackMode | undefined
    >();
    const openFeedback = (data: FeedbackData, mode: FeedbackMode) => {
        setFeedbackData(data);
        setShowFeedback(true);
        setFeedbackMode(mode);
    };

    const closeFeedback = () => {
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
