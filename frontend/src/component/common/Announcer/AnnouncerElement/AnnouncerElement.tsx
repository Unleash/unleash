import React, { ReactElement } from 'react';
import { useStyles } from 'component/common/Announcer/AnnouncerElement/AnnouncerElement.styles';
import { ANNOUNCER_ELEMENT_TEST_ID } from 'utils/testIds';

interface IAnnouncerElementProps {
    announcement?: string;
}

export const AnnouncerElement = ({
    announcement,
}: IAnnouncerElementProps): ReactElement => {
    const { classes: styles } = useStyles();

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic
            className={styles.container}
            data-testid={ANNOUNCER_ELEMENT_TEST_ID}
        >
            {announcement}
        </div>
    );
};
