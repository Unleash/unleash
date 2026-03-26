import { Divider, styled } from '@mui/material';

const OrDivider = styled(Divider)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledOrDivider = () => <OrDivider>OR</OrDivider>;

export default StyledOrDivider;
