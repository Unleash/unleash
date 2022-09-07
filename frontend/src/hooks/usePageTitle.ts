import { useEffect, useContext } from 'react';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';

export const usePageTitle = (title?: string) => {
    const { setAnnouncement } = useContext(AnnouncerContext);

    useEffect(() => {
        if (title) {
            document.title = title;
            return () => {
                document.title = DEFAULT_PAGE_TITLE;
            };
        }
    }, [title]);

    useEffect(() => {
        if (title && title !== DEFAULT_PAGE_TITLE) {
            setAnnouncement(`Navigated to ${title}`);
        }
    }, [setAnnouncement, title]);
};

const DEFAULT_PAGE_TITLE = 'Unleash';
