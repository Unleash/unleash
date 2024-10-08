import { Typography, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { AvatarGroupFromOwners } from 'component/common/AvatarGroupFromOwners/AvatarGroupFromOwners';
import type { ProjectSchemaOwners } from 'openapi';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

type Props = {
    roles: string[];
    owners: ProjectSchemaOwners;
};

const Wrapper = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
}));

const InfoSection = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const Roles = styled('ul')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexFlow: 'row wrap',
    listStyle: 'none',
    padding: 0,
}));

const TooltipRoles = styled('ul')(({ theme }) => ({
    gap: theme.spacing(1),
    flexFlow: 'column',
    display: 'flex',
    listStyle: 'none',
    padding: 0,
}));

const RoleBadge = styled(Badge)({
    whitespace: 'nowrap',
});

const StyledAvatarGroup = styled(AvatarGroupFromOwners)({
    width: 'max-content',
});

export const RoleAndOwnerInfo = ({ roles, owners }: Props) => {
    const firstRoles = roles.slice(0, 3);
    const extraRoles = roles.slice(3);
    return (
        <Wrapper>
            <InfoSection>
                {roles.length > 0 ? (
                    <>
                        <Typography
                            sx={{
                                whiteSpace: 'nowrap',
                            }}
                            variant='body1'
                            component='h4'
                        >
                            Your roles in this project:
                        </Typography>
                        <Roles>
                            {firstRoles.map((role) => (
                                <li>
                                    <RoleBadge key={role} color='secondary'>
                                        {role}
                                    </RoleBadge>
                                </li>
                            ))}
                            {extraRoles.length ? (
                                <li>
                                    <HtmlTooltip
                                        arrow
                                        title={
                                            <TooltipRoles>
                                                {extraRoles.map((role) => (
                                                    <li>
                                                        <RoleBadge>
                                                            {role}
                                                        </RoleBadge>
                                                    </li>
                                                ))}
                                            </TooltipRoles>
                                        }
                                    >
                                        <RoleBadge
                                            key={'extra-roles'}
                                            color='secondary'
                                        >
                                            {`+ ${extraRoles.length} more`}
                                        </RoleBadge>
                                    </HtmlTooltip>
                                </li>
                            ) : null}
                        </Roles>
                    </>
                ) : (
                    <span>You have no project roles in this project.</span>
                )}
            </InfoSection>
            <InfoSection>
                <Typography
                    variant='body1'
                    component='h4'
                    sx={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    Project owner{owners.length > 1 ? 's' : ''}
                </Typography>
                <StyledAvatarGroup users={owners} avatarLimit={3} />
            </InfoSection>
        </Wrapper>
    );
};
