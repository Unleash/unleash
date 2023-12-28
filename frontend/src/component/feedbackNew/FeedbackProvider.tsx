import { FeedbackComponent } from './FeedbackComponent';
import { FeedbackContext, IFeedbackData } from './FeedbackContext';
import { FC, useState } from 'react';

export const FeedbackProvider: FC = ({ children }) => {
    const [feedbackData, setFeedbackData] = useState<IFeedbackData | undefined>(
        undefined
    );

    const [showFeedback, setShowFeedback] = useState(false);
    const openFeedback = (data: IFeedbackData) => {
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
            <FeedbackComponent />
        </FeedbackContext.Provider>
    );
};
