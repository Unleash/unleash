import { useEffect, useContext } from 'react';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';

export const usePageTitle = (title?: string) => {
    const { announce } = useContext(AnnouncerContext);

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
            announce(`Navigated to ${title}`);
        }
    }, [announce, title]);
};

const DEFAULT_PAGE_TITLE = 'Unleash';
