import Add from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import { StyledAddActionButton } from './commonComponets.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

const StyledBodyHeader = styled('div')(({ theme }) => ({
    color: theme.palette.text.primary,
}));

export const ReleasePlanAddSafeguard = () => {
    const isSafeguardEnabled = useUiFlag('safeguards');

    return (
        <StyledBodyHeader>
            {isSafeguardEnabled && (
                <StyledAddActionButton color='primary' startIcon={<Add />}>
                    Add safeguard
                </StyledAddActionButton>
            )}
        </StyledBodyHeader>
    );
};
