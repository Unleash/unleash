import { createContext } from 'react';
import { ProvideFeedbackSchema } from '../../openapi';
import { IFeedbackCategory } from 'hooks/useSubmittedFeedback';

export interface IFeedbackContext {
    feedbackData: IFeedbackData | undefined;
    openFeedback: (data: IFeedbackData) => void;
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
