import type { IGroup } from 'interfaces/group';
import { type IRole, IRoleWithPermissions } from 'interfaces/role';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { Badge as MuiBadge } from 'component/common/Badge/Badge';

import type { IAccessOverviewPermissionCategory } from './AccessOverviewList';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
    styled,
} from '@mui/material';
import { NewAccessOverviewList } from './NewAccessOverviewList';
import { FC } from 'react';
import { useRole } from 'hooks/api/getters/useRole/useRole';

const Badge = styled(MuiBadge)({
    whiteSpace: 'nowrap',
});

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    boxShadow: 'none',
    margin: 0,
    marginTop: theme.spacing(1),
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

const StyledPersonIconWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25),
    color: theme.palette.info.main,
}));

const StyledTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing(1),
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
    rootRole?: IRole;
    groups?: IGroup[];
    categories: IAccessOverviewPermissionCategory[];
}

const RoleBadge = ({ role }: { role?: IRole }) => {
    return <Badge color='info'>{role?.name}</Badge>;
};

export const RootAccessOverviewAccordion = ({
    rootRole,
    groups,
    categories,
}: IAccessAccordionProps) => {
    const permissions = categories.flatMap(({ permissions }) => permissions);
    const hasAccess = permissions.filter((p) => p.hasPermission);
    const roles = [
        rootRole?.id,
        ...(groups?.map((g) => g.rootRole) ?? []),
    ].filter((id): id is number => id !== undefined);

    return (
        <Box>
            <Typography variant='body1' fontWeight='bold'>
                Instance access
            </Typography>
            <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMore />}>
                    <StyledTitleContainer>
                        <StyledPersonIconWrapper>
                            <PersonOutlinedIcon fontSize='small' />
                        </StyledPersonIconWrapper>
                        <StyledTitle>Root access</StyledTitle>
                        <RoleBadge role={rootRole} />
                    </StyledTitleContainer>
                    <StyledSecondaryLabel>
                        {hasAccess.length} / {permissions.length} permissions
                    </StyledSecondaryLabel>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                    <NewAccessOverviewList
                        categories={categories}
                        roles={roles ?? []}
                    />
                </StyledAccordionDetails>
            </StyledAccordion>
        </Box>
    );
};
