import { styled, SxProps, Theme } from '@mui/material';
import { ForwardedRef, forwardRef, useMemo, VFC } from 'react';
import useProjectRole from 'hooks/api/getters/useProjectRole/useProjectRole';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProjectAccess from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { ProjectRoleDescriptionProjectPermissions } from './ProjectRoleDescriptionProjectPermissions/ProjectRoleDescriptionProjectPermissions';
import { ProjectRoleDescriptionEnvironmentPermissions } from './ProjectRoleDescriptionEnvironmentPermissions/ProjectRoleDescriptionEnvironmentPermissions';

const StyledDescription = styled('div', {
    shouldForwardProp: prop =>
        prop !== 'roleId' && prop !== 'popover' && prop !== 'sx',
})<IProjectRoleDescriptionStyleProps>(({ theme, popover }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: theme.spacing(3),
    backgroundColor: popover
        ? theme.palette.background.paper
        : theme.palette.neutral.light,
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

interface IProjectRoleDescriptionStyleProps {
    popover?: boolean;
    className?: string;
    sx?: SxProps<Theme>;
}

interface IProjectRoleDescriptionProps
    extends IProjectRoleDescriptionStyleProps {
    roleId: number;
    projectId: string;
}

export const ProjectRoleDescription: VFC<IProjectRoleDescriptionProps> =
    forwardRef(
        (
            {
                roleId,
                projectId,
                className,
                sx,
                ...props
            }: IProjectRoleDescriptionProps,
            ref: ForwardedRef<HTMLDivElement>
        ) => {
            const { role } = useProjectRole(roleId.toString());
            const { access } = useProjectAccess(projectId);
            const accessRole = access?.roles.find(role => role.id === roleId);

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
                <StyledDescription
                    className={className}
                    sx={sx}
                    {...props}
                    ref={ref}
                >
                    <ConditionallyRender
                        condition={role.permissions?.length > 0}
                        show={
                            <>
                                <ConditionallyRender
                                    condition={Boolean(
                                        projectPermissions?.length
                                    )}
                                    show={
                                        <>
                                            <StyledDescriptionHeader>
                                                Project permissions
                                            </StyledDescriptionHeader>
                                            <StyledDescriptionBlock>
                                                <ProjectRoleDescriptionProjectPermissions
                                                    permissions={
                                                        role.permissions
                                                    }
                                                />
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
                                            {environments.map(environment => (
                                                <div key={environment}>
                                                    <StyledDescriptionSubHeader>
                                                        {environment}
                                                    </StyledDescriptionSubHeader>
                                                    <StyledDescriptionBlock>
                                                        <ProjectRoleDescriptionEnvironmentPermissions
                                                            environment={
                                                                environment
                                                            }
                                                            permissions={
                                                                role.permissions
                                                            }
                                                        />
                                                    </StyledDescriptionBlock>
                                                </div>
                                            ))}
                                        </>
                                    }
                                />
                            </>
                        }
                        elseShow={
                            <>
                                <StyledDescriptionSubHeader>
                                    {accessRole?.name}
                                </StyledDescriptionSubHeader>
                                <StyledDescriptionBlock>
                                    {accessRole?.description}
                                </StyledDescriptionBlock>
                            </>
                        }
                    />
                </StyledDescription>
            );
        }
    );
