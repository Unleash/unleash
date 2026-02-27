import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { ReactComponent as CaseSensitiveIcon } from 'assets/icons/case-sensitive.svg';
import { ReactComponent as CaseInsensitiveIcon } from 'assets/icons/case-insensitive.svg';
import type { FC } from 'react';

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

const StyledCaseInsensitiveIcon = styled(CaseInsensitiveIcon)(({ theme }) => ({
    path: {
        fill: theme.palette.text.disabled,
    },
    rect: {
        fill: theme.palette.text.secondary,
    },
}));

const StyledCaseSensitiveIcon = styled(CaseSensitiveIcon)(({ theme }) => ({
    path: {
        fill: 'currentColor',
    },
}));

type Props = {
    caseInsensitive: boolean;
    onToggleCaseSensitivity: () => void;
};

export const ToggleConstraintCaseSensitivity: FC<Props> = ({
    caseInsensitive,
    onToggleCaseSensitivity,
}) => {
    return (
        <HtmlTooltip
            title={`Make match${caseInsensitive ? ' ' : ' not '}case sensitive`}
            arrow
        >
            <StyledButton
                type='button'
                onClick={onToggleCaseSensitivity}
                aria-label={
                    caseInsensitive
                        ? 'The match is not case sensitive.'
                        : 'The match is case sensitive.'
                }
            >
                {caseInsensitive ? (
                    <StyledCaseInsensitiveIcon aria-hidden='true' />
                ) : (
                    <StyledCaseSensitiveIcon aria-hidden='true' />
                )}
            </StyledButton>
        </HtmlTooltip>
    );
};
