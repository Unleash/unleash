import { styled, SxProps, Theme } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IStrategySeparatorProps {
    text: 'AND' | 'OR';
    sx?: SxProps<Theme>;
}

const StyledContainer = styled('div')(({ theme }) => ({
    height: theme.spacing(1),
    position: 'relative',
    width: '100%',
}));

const StyledContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1.5),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.secondaryContainer,
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: '50%',
    left: theme.spacing(3),
    transform: 'translateY(-50%)',
}));

const StyledCenteredContent = styled(StyledContent)(({ theme }) => ({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.primary.border}`,
}));

export const StrategySeparator = ({ text, sx }: IStrategySeparatorProps) => (
    <StyledContainer sx={sx}>
        <ConditionallyRender
            condition={text === 'AND'}
            show={() => <StyledContent>{text}</StyledContent>}
            elseShow={() => (
                <StyledCenteredContent>{text}</StyledCenteredContent>
            )}
        />
    </StyledContainer>
);
