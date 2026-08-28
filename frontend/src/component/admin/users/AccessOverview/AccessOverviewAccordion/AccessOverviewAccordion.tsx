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
import type { IGroup } from 'interfaces/group.ts';
import type { IRole } from 'interfaces/role.ts';

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

const StyledTitleContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
});

const StyledTitle = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: theme.fontWeight.bold,
    minWidth: 0,
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
    rootRole: IRole | undefined;
    roles: number[] | undefined;
    groups: IGroup[] | undefined;
    title: React.ReactNode;
    children?: React.ReactNode;
}

export const AccessOverviewAccordion = ({
    categories,
    rootRole,
    roles,
    groups,
    title,
    children,
}: IAccessAccordionProps) => {
    const permissions = categories.flatMap(({ permissions }) => permissions);
    const hasAccess = permissions.filter((p) => p.hasPermission);

    return (
        <StyledAccordion>
            <StyledAccordionSummary expandIcon={<ExpandMore />}>
                <StyledTitleContainer>
                    <StyledTitle>{title}</StyledTitle>
                </StyledTitleContainer>
                <StyledSecondaryLabel>
                    {hasAccess.length} / {permissions.length} permissions
                </StyledSecondaryLabel>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                {permissions.length > 0 && (
                    <AccessOverviewList
                        categories={categories}
                        rootRole={rootRole}
                        roles={roles}
                        groups={groups}
                    />
                )}
                {children}
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
