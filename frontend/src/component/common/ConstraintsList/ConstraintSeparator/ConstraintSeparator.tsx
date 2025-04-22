import { Box, styled } from '@mui/material';

export const ConstraintSeparator = styled(({ ...props }) => (
    <Box role='separator' {...props}>
        and
    </Box>
))(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.5),
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    padding: theme.spacing(0.75, 1),
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    background: theme.palette.background.application,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    zIndex: theme.zIndex.fab,
    textTransform: 'uppercase',
}));
