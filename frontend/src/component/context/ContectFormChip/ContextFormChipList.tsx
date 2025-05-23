import type React from 'react';
import { styled } from '@mui/material';
import type { ILegalValue } from 'interfaces/context';
import { ContextFormChip } from './ContextFormChip.tsx';

const StyledContainer = styled('ul')(({ theme }) => ({
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    margin: 0,
    marginBottom: '1rem !important',
    maxHeight: '412px',
    overflow: 'auto',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    '&:empty': {
        display: 'none',
    },
}));

interface IContextFormChipListProps {
    legalValues: ILegalValue[];
    onRemove: (value: ILegalValue) => void;
}

export const ContextFormChipList: React.FC<IContextFormChipListProps> = ({
    legalValues,
    onRemove,
}) => (
    <StyledContainer>
        {legalValues.map((legalValue) => (
            <ContextFormChip
                key={legalValue.value}
                label={legalValue.value}
                description={legalValue.description}
                onRemove={() => onRemove(legalValue)}
            />
        ))}
    </StyledContainer>
);
