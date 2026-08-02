import { Divider, styled, type SxProps, type Theme } from '@mui/material';

const OrDivider = styled(Divider)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledOrDivider = ({ sx }: { sx?: SxProps<Theme> }) => (
    <OrDivider sx={sx}>OR</OrDivider>
);

export default StyledOrDivider;
