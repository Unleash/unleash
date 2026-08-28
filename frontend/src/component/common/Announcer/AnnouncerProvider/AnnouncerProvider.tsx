import {
    type ReactElement,
    type ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AnnouncerContext } from '../AnnouncerContext/AnnouncerContext.tsx';
import {
    AnnouncerElement,
    type IAnnouncement,
} from 'component/common/Announcer/AnnouncerElement/AnnouncerElement';

// Screen readers read announcements out, even if they're removed before being
// read out loud, so clearing them is good practice (to avoid stale info)
const ANNOUNCEMENT_LIFETIME_MS = 500;

interface IAnnouncerProviderProps {
    children: ReactNode;
}

export const AnnouncerProvider = ({
    children,
}: IAnnouncerProviderProps): ReactElement => {
    const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
    const nextId = useRef(0);

    const announce = useCallback((message: string) => {
        const id = nextId.current++;
        setAnnouncements((prev) => [...prev, { id, message }]);

        setTimeout(() => {
            setAnnouncements((prev) =>
                prev.filter((announcement) => announcement.id !== id),
            );
        }, ANNOUNCEMENT_LIFETIME_MS);
    }, []);

    const value = useMemo(() => ({ announce }), [announce]);

    return (
        <AnnouncerContext.Provider value={value}>
            {children}
            <AnnouncerElement announcements={announcements} />
        </AnnouncerContext.Provider>
    );
};
