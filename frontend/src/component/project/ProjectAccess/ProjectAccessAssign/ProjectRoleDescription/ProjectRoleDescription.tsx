import { styled } from '@mui/material';
import { useMemo, VFC } from 'react';
import useProjectRole from 'hooks/api/getters/useProjectRole/useProjectRole';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledDescription = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledDescriptionBlock = styled('div')(({ theme }) => ({
    '& p:last-child': {
        marginBottom: theme.spacing(2),
    },
}));

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(2),
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    marginBottom: theme.spacing(1),
}));

interface IProjectRoleDescriptionProps {
    roleId: number;
}

export const ProjectRoleDescription: VFC<IProjectRoleDescriptionProps> = ({
    roleId,
}) => {
    const { role } = useProjectRole(roleId.toString());

    const environments = useMemo(() => {
        const environments = new Set<string>();
        role.permissions
            ?.filter((permission: any) => permission.environment)
            .forEach((permission: any) => {
                environments.add(permission.environment);
            });
        return [...environments].sort();
    }, [role]);

    const projectPermissions = useMemo(() => {
        return role.permissions?.filter(
            (permission: any) => !permission.environment
        );
    }, [role]);

    return (
        <StyledDescription>
            <ConditionallyRender
                condition={Boolean(projectPermissions?.length)}
                show={
                    <>
                        <StyledDescriptionHeader>
                            Project permissions
                        </StyledDescriptionHeader>
                        <StyledDescriptionBlock>
                            {role.permissions
                                ?.filter(
                                    (permission: any) => !permission.environment
                                )
                                .map(
                                    (permission: any) => permission.displayName
                                )
                                .sort()
                                .map((permission: any) => (
                                    <p key={permission}>{permission}</p>
                                ))}
                        </StyledDescriptionBlock>
                    </>
                }
            />
            <ConditionallyRender
                condition={Boolean(environments.length)}
                show={
                    <>
                        <StyledDescriptionHeader>
                            Environment permissions
                        </StyledDescriptionHeader>
                        {environments.map((environment: any) => (
                            <div key={environment}>
                                <StyledDescriptionSubHeader>
                                    {environment}
                                </StyledDescriptionSubHeader>
                                <StyledDescriptionBlock>
                                    {role.permissions
                                        .filter(
                                            (permission: any) =>
                                                permission.environment ===
                                                environment
                                        )
                                        .map(
                                            (permission: any) =>
                                                permission.displayName
                                        )
                                        .sort()
                                        .map((permission: any) => (
                                            <p key={permission}>{permission}</p>
                                        ))}
                                </StyledDescriptionBlock>
                            </div>
                        ))}
                    </>
                }
            />
        </StyledDescription>
    );
};
