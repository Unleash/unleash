import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import CaseSensitiveIcon from 'assets/icons/case-sensitive.svg?react';
import type { FC } from 'react';

const StyledButton = styled('button')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '30px',
    width: '30px',
    fontWeight: theme.typography.fontWeightBold,
    borderRadius: `${theme.shape.borderRadius}px`,
    border: 'none',
    padding: theme.spacing(0),
    color: theme.palette.text.disabled,
    background: theme.palette.neutral.container,
    cursor: 'pointer',
    transition: 'all 0.03s ease',
    '&[aria-pressed="true"]': {
        color: theme.palette.primary.onContainer,
        background: theme.palette.primary.container,
    },
}));

const StyledCaseSensitiveIcon = styled(CaseSensitiveIcon)({
    path: {
        fill: 'currentColor',
    },
});

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
            describeChild
        >
            <StyledButton
                type='button'
                aria-pressed={!caseInsensitive}
                onClick={onToggleCaseSensitivity}
                aria-label='Case-sensitive'
            >
                <StyledCaseSensitiveIcon aria-hidden='true' />
            </StyledButton>
        </HtmlTooltip>
    );
};
