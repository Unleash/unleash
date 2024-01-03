import { createContext } from 'react';
import { IFeedbackCategory } from 'hooks/useSubmittedFeedback';

export interface IFeedbackContext {
    feedbackData: FeedbackData | undefined;
    openFeedback: (data: FeedbackData) => void;
    closeFeedback: () => void;
    showFeedback: boolean;
    setShowFeedback: (visible: boolean) => void;
}

interface IFeedbackText {
    title: string;
    positiveLabel: string;
    areasForImprovementsLabel: string;
}

export type FeedbackData = IFeedbackText & {
    category: IFeedbackCategory;
};

export const FeedbackContext = createContext<IFeedbackContext | undefined>(
    undefined,
);
