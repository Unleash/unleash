import { Box, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IStrategySeparatorProps {
    text: 'AND' | 'OR';
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
    padding: theme.spacing(0.75, 1.5),
}));

export const StrategySeparator = ({ text }: IStrategySeparatorProps) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: theme.spacing(text === 'AND' ? 1 : 1.5),
                position: 'relative',
                width: '100%',
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
