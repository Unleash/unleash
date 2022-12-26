interface IProjectRoleDescriptionProjectPermissionsProps {
    permissions: any[];
}

export const ProjectRoleDescriptionProjectPermissions = ({
    permissions,
}: IProjectRoleDescriptionProjectPermissionsProps) => (
    <>
        {permissions
            ?.filter((permission: any) => !permission.environment)
            .map((permission: any) => permission.displayName)
            .sort()
            .map((permission: any) => (
                <p key={permission}>{permission}</p>
            ))}
    </>
);
