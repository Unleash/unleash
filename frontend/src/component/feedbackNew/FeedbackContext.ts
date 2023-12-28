import { createContext } from 'react';
import { ProvideFeedbackSchema } from '../../openapi';

interface IFeedbackContext {
    feedbackData: IFeedbackData | undefined;
    openFeedback: (data: IFeedbackData) => void;
    closeFeedback: () => void;
    showFeedback: boolean;
    setShowFeedback: (visible: boolean) => void;
}

type IFeedbackText = {
    title: string;
    positiveLabel: string;
    areasForImprovementsLabel: string;
};

export type IFeedbackData = Pick<
    ProvideFeedbackSchema,
    'category' | 'userType'
> &
    IFeedbackText;

export const FeedbackContext = createContext<IFeedbackContext | undefined>(
    undefined,
);
