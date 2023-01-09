import React, { ReactElement } from 'react';
import { ANNOUNCER_ELEMENT_TEST_ID } from 'utils/testIds';
import { styled } from '@mui/material';

interface IAnnouncerElementProps {
    announcement?: string;
}

const StyledContainer = styled('div')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    zIndex: -1,
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
});

export const AnnouncerElement = ({
    announcement,
}: IAnnouncerElementProps): ReactElement => {
    return (
        <StyledContainer
            role="status"
            aria-live="polite"
            aria-atomic
            data-testid={ANNOUNCER_ELEMENT_TEST_ID}
        >
            {announcement}
        </StyledContainer>
    );
};
