import { styled, Card as MUICard, Box } from '@mui/material';

const StyledCard = styled(MUICard)(({ theme }) => ({
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
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    position: 'relative',
}));

const StyledCardBodyHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
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
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const StyledCardFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 2),
    display: 'flex',
    background: theme.palette.envAccordion.expanded,
    boxShadow: theme.boxShadows.accordionFooter,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`,
    minHeight: theme.spacing(6.25),
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    textWrap: 'nowrap',
}));

interface ICardProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    headerActions?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}

export const Card = ({
    icon,
    title,
    headerActions,
    footer,
    children,
}: ICardProps) => (
    <StyledCard>
        <StyledCardBody>
            <StyledCardBodyHeader>
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
        {footer && <StyledCardFooter>{footer}</StyledCardFooter>}
    </StyledCard>
);
