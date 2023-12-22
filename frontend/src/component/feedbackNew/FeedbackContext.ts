import { createContext } from 'react';
import { ProvideFeedbackSchema } from '../../openapi';
import { DEFAULT_FEEDBACK_DATA } from './FeedbackProvider';

interface IFeedbackContext {
    feedbackData: ProvideFeedbackSchema;
    openFeedback: (data: ProvideFeedbackSchema) => void;
    closeFeedback: () => void;
    showFeedback: boolean;
    setShowFeedback: (visible: boolean) => void;
}

const setShowFeedback = () => {
    throw new Error('setShowFeedback called outside FeedbackContext');
};

const openFeedback = () => {
    throw new Error('openFeedback called outside FeedbackContext');
};

const closeFeedback = () => {
    throw new Error('closeFeedback called outside FeedbackContext');
};

export const FeedbackContext = createContext<IFeedbackContext>({
    feedbackData: DEFAULT_FEEDBACK_DATA,
    showFeedback: true,
    setShowFeedback: setShowFeedback,
    openFeedback: openFeedback,
    closeFeedback: closeFeedback,
});
