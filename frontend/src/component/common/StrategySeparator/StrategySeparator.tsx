import { Box, styled, useTheme } from '@mui/material';

interface IStrategySeparatorProps {
    text: 'AND' | 'OR';
}

const StyledAnd = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.background.elevation2,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: '50%',
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    lineHeight: 1,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledOr = styled(StyledAnd)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.border,
    left: theme.spacing(4),
}));

const StyledSeparator = styled('hr')(({ theme }) => ({
    border: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    position: 'absolute',
    top: '50%',
    width: '100%',
}));

export const StrategySeparator = ({ text }: IStrategySeparatorProps) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                height: theme.spacing(text === 'AND' ? 1 : 1.5),
                position: 'relative',
            }}
            aria-hidden={true}
        >
            {text === 'AND' ? (
                <StyledAnd>{text}</StyledAnd>
            ) : (
                <>
                    <StyledSeparator />
                    <StyledOr>{text}</StyledOr>
                </>
            )}
        </Box>
    );
};
