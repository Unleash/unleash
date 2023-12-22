import { FeedbackComponent } from './FeedbackComponent';
import { FeedbackContext } from './FeedbackContext';
import { FC, useState } from 'react';
import { ProvideFeedbackSchema } from '../../openapi';

export const DEFAULT_FEEDBACK_DATA = {
    category: 'general',
};
export const FeedbackProvider: FC = ({ children }) => {
    const [feedbackData, setFeedbackData] = useState<ProvideFeedbackSchema>(
        DEFAULT_FEEDBACK_DATA,
    );

    const [showFeedback, setShowFeedback] = useState(false);
    const openFeedback = (data: ProvideFeedbackSchema) => {
        setFeedbackData(data);
        setShowFeedback(true);
    };

    const closeFeedback = () => {
        setFeedbackData(DEFAULT_FEEDBACK_DATA);
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
            <FeedbackComponent />
        </FeedbackContext.Provider>
    );
};
