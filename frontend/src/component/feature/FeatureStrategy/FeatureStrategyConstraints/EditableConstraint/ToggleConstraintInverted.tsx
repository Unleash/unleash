import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import EqualsIcon from 'assets/icons/constraint-equals.svg?react';
import NotEqualsIcon from 'assets/icons/constraint-not-equals.svg?react';

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
    '&:not(:disabled):is(:hover, :focus-visible)': {
        outline: `1px solid ${theme.palette.primary.main}`,
    },
    '&:disabled': {
        color: theme.palette.action.disabled,
        background: 'transparent',
        border: `1px solid ${theme.palette.action.disabledBackground}`,
        cursor: 'not-allowed',
    },
}));

const StyledEqualsIcon = styled(EqualsIcon)({
    path: {
        fill: 'currentcolor',
    },
});

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
    inverted: boolean;
    disabledText?: string;
}

export const ToggleConstraintInverted = ({
    inverted,
    onToggleInverted,
    disabledText,
}: ToggleInvertedProps) => {
    const disabled = Boolean(disabledText);

    const tooltipTitle =
        disabledText ??
        `Make the selected operator${inverted ? ' inclusive' : ' exclusive'}`;

    const ariaLabel =
        disabledText ??
        (inverted
            ? 'The constraint operator is exclusive.'
            : 'The constraint operator is inclusive.');

    return (
        <HtmlTooltip title={tooltipTitle} arrow>
            <span>
                <StyledButton
                    type='button'
                    onClick={onToggleInverted}
                    disabled={disabled}
                    aria-label={ariaLabel}
                >
                    <ConstrainInversionIcon inverted={Boolean(inverted)} />
                </StyledButton>
            </span>
        </HtmlTooltip>
    );
};
