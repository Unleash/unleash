import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import {
    AccessOverviewList,
    type IAccessOverviewPermissionCategory,
} from './AccessOverviewList.tsx';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    boxShadow: 'none',
    margin: 0,
    '&:before': {
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    '& .MuiAccordionSummary-content': {
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '30px',
    },
}));

const StyledTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledSecondaryLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginRight: theme.spacing(1),
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
}));

interface IAccessAccordionProps {
    categories: IAccessOverviewPermissionCategory[];
    children: React.ReactNode;
}

export const AccessOverviewAccordion = ({
    categories,
    children,
}: IAccessAccordionProps) => {
    const permissions = categories.flatMap(({ permissions }) => permissions);

    return (
        <StyledAccordion>
            <StyledAccordionSummary expandIcon={<ExpandMore />}>
                <StyledTitleContainer>
                    <StyledTitle>{children}</StyledTitle>
                </StyledTitleContainer>
                <StyledSecondaryLabel>
                    {
                        permissions.filter(({ hasPermission }) => hasPermission)
                            .length
                    }
                    /{permissions.length} permissions
                </StyledSecondaryLabel>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <AccessOverviewList categories={categories} />
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
