import { Alert, styled } from '@mui/material';
import type { FC } from 'react';
import { getTargetRange } from './useEditableConstraint/ip-address.ts';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightRegular,

    '& .MuiAlert-message': {
        padding: 0,
        // long IPv6 ranges have nothing to break on, so let them break anywhere
        overflowWrap: 'anywhere',
    },
}));

const StyledLabel = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

export const formatTargetRange = ([start, end]: [string, string]): string =>
    `${start} - ${end}`;

export const CidrTargetRange: FC<{ value: string }> = ({ value }) => {
    const range = getTargetRange(value.trim());

    if (!range) {
        return null;
    }

    return (
        <StyledAlert severity='info' icon={false} role='status'>
            <StyledLabel>Target range</StyledLabel>: {formatTargetRange(range)}
        </StyledAlert>
    );
};
