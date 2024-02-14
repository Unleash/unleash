import { Box, styled } from '@mui/material';

export const StyledInnerBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

export const StyledInnerBoxHeader = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

// row for inner containers
export const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
});

export const StyledCol = styled('div')({
    flex: 1,
    margin: '0 4px',
});

const StyledBoxContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.seen.primary,
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: '50%',
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    lineHeight: 1,
}));

export const BoxSeparator: React.FC = ({ children }) => {
    return (
        <Box
            sx={{
                height: 1.5,
                position: 'relative',
                width: '100%',
            }}
        >
            <StyledBoxContent>{children}</StyledBoxContent>
        </Box>
    );
};
