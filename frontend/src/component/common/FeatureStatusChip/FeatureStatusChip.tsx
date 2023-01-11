import { Chip, styled } from '@mui/material';

interface IStatusChip {
    stale: boolean;
    showActive?: boolean;
}

const StyledChip = styled(Chip)(({ theme }) => ({
    background: 'transparent',
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
}));

export const FeatureStatusChip = ({
    stale,
    showActive = true,
}: IStatusChip) => {
    if (!stale && !showActive) {
        return null;
    }

    const title = stale
        ? 'Feature toggle is deprecated.'
        : 'Feature toggle is active.';
    const value = stale ? 'Stale' : 'Active';

    return (
        <div data-loading style={{ marginLeft: '8px' }}>
            <StyledChip
                color="primary"
                variant="outlined"
                title={title}
                label={value}
            />
        </div>
    );
};
