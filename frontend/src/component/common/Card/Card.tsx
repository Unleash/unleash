import {
    styled,
    Card as MUICard,
    Box,
    type CardProps,
    type Theme,
    type CSSObject,
} from '@mui/material';

type CardVariant = 'primary' | 'secondary';
type CardComponent = 'card' | 'header' | 'body' | 'footer';
type VariantProps = {
    [key in CardVariant]: {
        [key in CardComponent]: (theme: Theme) => CSSObject;
    };
};

const variants: VariantProps = {
    primary: {
        card: (theme: Theme): CSSObject => ({
            backgroundColor: theme.palette.background.default,
            background: theme.palette.secondary.light,
            '&:hover': {
                backgroundColor: theme.palette.neutral.light,
            },
        }),
        header: (theme: Theme): CSSObject => ({
            fontWeight: theme.typography.fontWeightRegular,
        }),
        body: (theme: Theme): CSSObject => ({
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.secondary,
            '&:hover': {
                backgroundColor: theme.palette.neutral.light,
            },
            fontSize: theme.fontSizes.smallBody,
        }),
        footer: (theme: Theme): CSSObject => ({
            borderTop: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.elevation1,
            boxShadow: theme.boxShadows.accordionFooter,
            color: theme.palette.text.secondary,
        }),
    },
    secondary: {
        card: (theme: Theme): CSSObject => ({
            backgroundColor: theme.palette.secondary.light,
            borderColor: theme.palette.secondary.border,
            color: theme.palette.text.primary,
        }),
        header: (theme: Theme): CSSObject => ({
            fontWeight: theme.typography.fontWeightBold,
        }),
        body: (theme: Theme): CSSObject => ({
            backgroundColor: theme.palette.secondary.light,
            color: theme.palette.text.primary,
        }),
        footer: (theme: Theme): CSSObject => ({
            background: theme.palette.secondary.light,
            fontSize: theme.fontSizes.bodySize,
        }),
    },
};

const StyledCard = styled(MUICard, {
    shouldForwardProp: (prop) => prop !== 'cardVariant',
})<{ cardVariant: CardVariant }>(({ theme, cardVariant }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    borderRadius: theme.shape.borderRadiusMedium,
    ...variants[cardVariant].card(theme),
}));

const StyledCardBody = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'cardVariant',
})<{ cardVariant: CardVariant }>(({ theme, cardVariant }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    position: 'relative',
    ...variants[cardVariant].body(theme),
}));

const StyledCardBodyHeader = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'cardVariant',
})<{ cardVariant: CardVariant }>(({ theme, cardVariant }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: theme.typography.body1.fontSize,
    color: theme.palette.text.primary,
    lineHeight: '1.2',
    ...variants[cardVariant].header(theme),
}));

const StyledCardIconContainer = styled(Box)(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    padding: theme.spacing(0.5),
    alignSelf: 'baseline',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusMedium,
    '& > svg': {
        height: theme.spacing(2),
        width: theme.spacing(2),
    },
}));

const StyledCardActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginLeft: 'auto',
}));

const StyledCardBodyContent = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const StyledCardFooter = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'cardVariant',
})<{ cardVariant: CardVariant }>(({ theme, cardVariant }) => ({
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.spacing(6.25),
    fontSize: theme.fontSizes.smallerBody,
    textWrap: 'nowrap',
    ...variants[cardVariant].footer(theme),
}));

interface ICardProps extends Omit<CardProps, 'title'> {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    headerActions?: React.ReactNode;
    footer?: React.ReactNode;
    cardVariant?: CardVariant;
    children?: React.ReactNode;
}

export const Card = ({
    icon,
    title,
    headerActions,
    footer,
    cardVariant = 'primary',
    children,
    ...props
}: ICardProps) => (
    <StyledCard cardVariant={cardVariant} {...props}>
        <StyledCardBody cardVariant={cardVariant}>
            <StyledCardBodyHeader cardVariant={cardVariant}>
                {icon && (
                    <StyledCardIconContainer>{icon}</StyledCardIconContainer>
                )}
                {title}
                {headerActions && (
                    <StyledCardActions>{headerActions}</StyledCardActions>
                )}
            </StyledCardBodyHeader>
            {children && (
                <StyledCardBodyContent>{children}</StyledCardBodyContent>
            )}
        </StyledCardBody>
        {footer && (
            <StyledCardFooter cardVariant={cardVariant}>
                {footer}
            </StyledCardFooter>
        )}
    </StyledCard>
);
