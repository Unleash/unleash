import { Box, styled, useTheme, SxProps, Theme } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IStrategySeparatorProps {
    text: 'AND' | 'OR';
    sx?: SxProps<Theme>;
}

const StyledContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.secondaryContainer,
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: '50%',
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    lineHeight: 1,
}));

const StyledCenteredContent = styled(StyledContent)(({ theme }) => ({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.activityIndicators.primary,
    border: `1px solid ${theme.palette.primary.border}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

export const StrategySeparator = ({ text, sx }: IStrategySeparatorProps) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: theme.spacing(text === 'AND' ? 1 : 1.5),
                position: 'relative',
                width: '100%',
                ..sx
            }}
        >
            <ConditionallyRender
                condition={text === 'AND'}
                show={() => <StyledContent>{text}</StyledContent>}
                elseShow={() => (
                    <StyledCenteredContent>{text}</StyledCenteredContent>
                )}
            />
        </Box>
    );
};
