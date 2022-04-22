import React, { ReactElement } from 'react';
import { useStyles } from 'component/common/Announcer/AnnouncerElement/AnnouncerElement.styles';

interface IAnnouncerElementProps {
    announcement?: string;
}

export const AnnouncerElement = ({
    announcement,
}: IAnnouncerElementProps): ReactElement => {
    const styles = useStyles();

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic
            className={styles.container}
        >
            {announcement}
        </div>
    );
};
