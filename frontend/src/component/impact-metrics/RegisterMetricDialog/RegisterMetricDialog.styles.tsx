import { styled } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';

/**
 * A card container with a border that highlights on hover/focus.
 *
 * Any child with the `data-card-action` attribute becomes the card's
 * primary action: it gets a pseudo-element overlay that stretches over
 * the entire card, making the whole card clickable/tappable. You should only have one such child.
 *
 *   <Card>
 *     <a data-card-action href="...">Link text</a>
 *     <p>Supporting content</p>
 *   </Card>
 */
export const Card = styled('div')(({ theme }) => ({
    position: 'relative',
    border: `1.5px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    background: theme.palette.background.default,
    padding: theme.spacing(2),
    transition: 'border-color 150ms ease',
    '&:hover, &:focus-within': {
        borderColor: theme.palette.primary.main,
    },
    '[data-card-action]': {
        color: 'inherit',
        textDecoration: 'none',
        '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
        },
        '&:focus-visible': {
            outline: 'none',
        },
    },
}));

export const ExternalLink = styled(
    ({ children, ...props }: React.ComponentProps<typeof Link>) => (
        <Link target='_blank' rel='noopener noreferrer' {...props}>
            {children} <OpenInNewIcon />
        </Link>
    ),
)(({ theme }) => ({
    textDecoration: 'underline',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    width: 'fit-content',
    borderRadius: theme.shape.borderRadius,

    ':focus-visible': {
        outline: '2px solid currentColor',
        outlineOffset: theme.spacing(0.5),
    },

    svg: {
        fontSize: '1.4em',
        verticalAlign: 'bottom',
    },
}));
