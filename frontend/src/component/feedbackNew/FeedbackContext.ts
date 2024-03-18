import { createContext } from 'react';
import type { IFeedbackCategory } from 'hooks/useSubmittedFeedback';

export type FeedbackMode = 'automatic' | 'manual';
export interface IFeedbackContext {
    feedbackData: FeedbackData | undefined;
    openFeedback: (
        data: FeedbackData,
        mode: FeedbackMode,
        variant?: string,
    ) => void;
    closeFeedback: () => void;
    showFeedback: boolean;
    setShowFeedback: (visible: boolean) => void;
    feedbackMode: FeedbackMode | undefined;
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
