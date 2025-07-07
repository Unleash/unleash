import { type ReactElement, useMemo, useState, type ReactNode } from 'react';
import { AnnouncerContext } from '../AnnouncerContext/AnnouncerContext.tsx';
import { AnnouncerElement } from 'component/common/Announcer/AnnouncerElement/AnnouncerElement';

interface IAnnouncerProviderProps {
    children: ReactNode;
}

export const AnnouncerProvider = ({
    children,
}: IAnnouncerProviderProps): ReactElement => {
    const [announcement, setAnnouncement] = useState<string>();

    const value = useMemo(
        () => ({
            setAnnouncement,
        }),
        [setAnnouncement],
    );

    return (
        <AnnouncerContext.Provider value={value}>
            {children}
            <AnnouncerElement announcement={announcement} />
        </AnnouncerContext.Provider>
    );
};
