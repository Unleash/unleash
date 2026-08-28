import React from 'react';

export interface IAnnouncerContext {
    announce: (message: string) => void;
}

const announcePlaceholder = () => {
    throw new Error('announce called outside AnnouncerContext');
};

// AnnouncerContext announces messages to screen readers through a live region.
// Call announce to broadcast a new message to the screen reader.
export const AnnouncerContext = React.createContext<IAnnouncerContext>({
    announce: announcePlaceholder,
});
