import {
    FeedbackComponent,
    FeedbackComponentWrapper,
} from './FeedbackComponent';
import { FeedbackContext, FeedbackData } from './FeedbackContext';
import { FC, useState } from 'react';

export const FeedbackProvider: FC = ({ children }) => {
    const [feedbackData, setFeedbackData] = useState<FeedbackData | undefined>(
        undefined,
    );

    const [showFeedback, setShowFeedback] = useState(false);
    const openFeedback = (data: FeedbackData) => {
        setFeedbackData(data);
        setShowFeedback(true);
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
            }}
        >
            {children}
            <FeedbackComponentWrapper />
        </FeedbackContext.Provider>
    );
};
