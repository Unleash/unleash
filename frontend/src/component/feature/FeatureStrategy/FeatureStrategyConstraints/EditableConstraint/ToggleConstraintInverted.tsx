import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { ReactComponent as EqualsIcon } from 'assets/icons/constraint-equals.svg';
import { ReactComponent as NotEqualsIcon } from 'assets/icons/constraint-not-equals.svg';

const StyledButton = styled('button')(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallerBody,
    background: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightBold,
    transition: 'all 0.03s ease',
    '&:is(:hover, :focus-visible)': {
        outline: `1px solid ${theme.palette.primary.main}`,
    },
}));

const StyledEqualsIcon = styled(EqualsIcon)(({ theme }) => ({
    path: {
        fill: 'currentcolor',
    },
}));

const StyledNotEqualsIcon = styled(NotEqualsIcon)(({ theme }) => ({
    path: {
        fill: theme.palette.text.disabled,
    },
    rect: {
        fill: theme.palette.text.secondary,
    },
}));

export const ConstrainInversionIcon = ({ inverted }: { inverted: boolean }) => {
    return inverted ? (
        <StyledNotEqualsIcon aria-hidden='true' />
    ) : (
        <StyledEqualsIcon aria-hidden='true' />
    );
};

interface ToggleInvertedProps {
    onToggleInverted: () => void;
    inverted?: boolean;
}

export const ToggleConstraintInverted = ({
    inverted,
    onToggleInverted,
}: ToggleInvertedProps) => {
    return (
        <HtmlTooltip
            title={`Make the selected operator${inverted ? ' inclusive' : ' exclusive'}`}
            arrow
        >
            <StyledButton
                type='button'
                onClick={onToggleInverted}
                aria-label={
                    inverted
                        ? 'The constraint operator is exclusive.'
                        : 'The constraint operator is inclusive.'
                }
            >
                <ConstrainInversionIcon inverted={!!inverted} />
            </StyledButton>
        </HtmlTooltip>
    );
};
