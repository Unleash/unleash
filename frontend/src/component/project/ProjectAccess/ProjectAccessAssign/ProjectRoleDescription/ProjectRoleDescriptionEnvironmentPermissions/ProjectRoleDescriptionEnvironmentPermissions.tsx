interface IProjectRoleDescriptionEnvironmentPermissionsProps {
    environment: string;
    permissions: any[];
}

export const ProjectRoleDescriptionEnvironmentPermissions = ({
    environment,
    permissions,
}: IProjectRoleDescriptionEnvironmentPermissionsProps) => (
    <>
        {[
            ...new Set(
                permissions
                    .filter(
                        (permission: any) =>
                            permission.environment === environment
                    )
                    .map((permission: any) => permission.displayName)
            ),
        ]
            .sort()
            .map((permission: any) => (
                <p key={`${environment}-${permission}`}>{permission}</p>
            ))}
    </>
);
