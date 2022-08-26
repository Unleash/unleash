import React from 'react';

export interface IAnnouncerContext {
    setAnnouncement: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const setAnnouncementPlaceholder = () => {
    throw new Error('setAnnouncement called outside AnnouncerContext');
};

// AnnouncerContext announces messages to screen readers through a live region.
// Call setAnnouncement to broadcast a new message to the screen reader.
export const AnnouncerContext = React.createContext<IAnnouncerContext>({
    setAnnouncement: setAnnouncementPlaceholder,
});
