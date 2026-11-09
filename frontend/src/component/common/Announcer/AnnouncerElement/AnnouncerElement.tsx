import type { ReactElement } from 'react';
import { ANNOUNCER_ELEMENT_TEST_ID } from 'utils/testIds';
import { styled } from '@mui/material';

export interface IAnnouncement {
    id: number;
    message: string;
}

interface IAnnouncerElementProps {
    announcements: IAnnouncement[];
}

const StyledContainer = styled('div')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
});

export const AnnouncerElement = ({
    announcements,
}: IAnnouncerElementProps): ReactElement => {
    return (
        <StyledContainer
            role='log'
            aria-live='polite'
            data-testid={ANNOUNCER_ELEMENT_TEST_ID}
        >
            {announcements.map(({ id, message }) => (
                <div key={id}>{message}</div>
            ))}
        </StyledContainer>
    );
};
