import { Cancel } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';

interface IContextFormChipProps {
    label: string;
    description?: string;
    onRemove: () => void;
}

const StyledContainer = styled('li')(({ theme }) => ({
    display: 'grid',
    lineHeight: 1.25,
    gridTemplateColumns: '1fr auto',
    alignSelf: 'start',
    alignItems: 'start',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadius,
    wordBreak: 'break-word',
}));

const StyledLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
}));

const StyledButton = styled('button')(({ theme }) => ({
    all: 'unset',
    lineHeight: 0.1,
    paddingTop: '1px',
    display: 'block',
    cursor: 'pointer',
    '& svg': {
        fontSize: theme.fontSizes.bodySize,
        opacity: 0.5,
    },
    '&:hover svg, &:focus-visible svg': {
        opacity: 0.75,
    },
}));

export const ContextFormChip = ({
    label,
    description,
    onRemove,
}: IContextFormChipProps) => {
    return (
        <StyledContainer>
            <div>
                <StyledLabel>{label}</StyledLabel>
                <ConditionallyRender
                    condition={Boolean(description)}
                    show={() => (
                        <StyledDescription>{description}</StyledDescription>
                    )}
                />
            </div>
            <StyledButton onClick={onRemove}>
                <Cancel titleAccess="Remove" />
            </StyledButton>
        </StyledContainer>
    );
};
