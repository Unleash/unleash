import type { FC } from 'react';
import { styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';

type ChangeSegmentNameProps = {
    name?: string;
    previousName?: string;
};

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
    display: 'flex',
}));

export const ChangeSegmentName: FC<ChangeSegmentNameProps> = ({
    name,
    previousName,
}) => (
    <Truncated>
        <NameWithChangeInfo previousName={previousName} newName={name} />
    </Truncated>
);
