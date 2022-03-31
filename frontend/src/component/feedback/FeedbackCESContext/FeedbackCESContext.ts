import React, { createContext } from 'react';

export type ShowFeedbackCES = React.Dispatch<
    React.SetStateAction<IFeedbackCESState | undefined>
>;

export interface IFeedbackCESContext {
    showFeedbackCES: ShowFeedbackCES;
    hideFeedbackCES: () => void;
}

export interface IFeedbackCESState {
    path: `/${string}`;
    title: string;
    text: string;
}

const showFeedbackCESPlaceholder = () => {
    throw new Error('showFeedbackCES called outside feedbackCESContext');
};

const hideFeedbackCESPlaceholder = () => {
    throw new Error('hideFeedbackCES called outside feedbackCESContext');
};

export const feedbackCESContext = createContext<IFeedbackCESContext>({
    showFeedbackCES: showFeedbackCESPlaceholder,
    hideFeedbackCES: hideFeedbackCESPlaceholder,
});
