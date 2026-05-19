import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import type { IAccessOverviewPermission } from 'interfaces/permissions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';

const StyledEnvAccessHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledEnvTable = styled('table')(({ theme }) => ({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.body2.fontSize,
    '& th, & td': {
        padding: theme.spacing(1.5, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        verticalAlign: 'middle',
    },
    '& th': {
        fontWeight: 'bold',
        backgroundColor: theme.palette.background.default,
        textAlign: 'left',
    },
    '& th:not(:first-of-type)': {
        textAlign: 'center',
        minWidth: theme.spacing(12),
    },
    '& td:not(:first-of-type)': {
        textAlign: 'center',
    },
    '& tbody tr:last-child td': {
        borderBottom: 'none',
    },
}));

const EnvDataCollector = ({
    id,
    project,
    environment,
    onDataLoaded,
}: {
    id: string;
    project: string;
    environment: string;
    onDataLoaded: (
        env: string,
        permissions: IAccessOverviewPermission[],
    ) => void;
}) => {
    const { overview } = useUserAccessOverview(id, project, environment);

    useEffect(() => {
        if (overview?.environment !== undefined) {
            onDataLoaded(environment, overview.environment);
        }
    }, [environment, overview?.environment, onDataLoaded]);

    return null;
};

export const EnvironmentAccessTable = ({
    id,
    project,
    environments,
    searchValue,
}: {
    id: string;
    project: string;
    environments: string[];
    searchValue: string;
}) => {
    const [envPermissions, setEnvPermissions] = useState<
        Record<string, IAccessOverviewPermission[]>
    >({});

    const handleDataLoaded = useCallback(
        (env: string, permissions: IAccessOverviewPermission[]) => {
            setEnvPermissions((prev) => {
                if (prev[env] === permissions) return prev;
                return { ...prev, [env]: permissions };
            });
        },
        [],
    );

    const basePermissions = useMemo(() => {
        const firstData = Object.values(envPermissions)[0];
        if (!firstData) return [];
        const sorted = [...firstData].sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
        );
        if (!searchValue) return sorted;
        const lower = searchValue.toLowerCase();
        return sorted.filter((p) =>
            p.displayName.toLowerCase().includes(lower),
        );
    }, [envPermissions, searchValue]);

    if (environments.length === 0) return null;

    return (
        <>
            {environments.map((env) => (
                <EnvDataCollector
                    key={env}
                    id={id}
                    project={project}
                    environment={env}
                    onDataLoaded={handleDataLoaded}
                />
            ))}
            {basePermissions.length > 0 && (
                <>
                    <StyledEnvAccessHeader>
                        Environment access
                    </StyledEnvAccessHeader>
                    <StyledEnvTable>
                        <thead>
                            <tr>
                                <th>Permission</th>
                                {environments.map((env) => (
                                    <th key={env}>{env}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {basePermissions.map((permission) => (
                                <tr key={permission.name}>
                                    <td>
                                        <Highlighter search={searchValue}>
                                            {permission.displayName}
                                        </Highlighter>
                                    </td>
                                    {environments.map((env) => {
                                        const hasPerm =
                                            envPermissions[env]?.find(
                                                (p) =>
                                                    p.name === permission.name,
                                            )?.hasPermission ?? false;
                                        return (
                                            <td key={env}>
                                                {hasPerm ? (
                                                    <Check
                                                        sx={{
                                                            color: 'success.main',
                                                            fontSize: 20,
                                                            display: 'block',
                                                            margin: 'auto',
                                                        }}
                                                    />
                                                ) : (
                                                    <Close
                                                        sx={{
                                                            color: 'error.main',
                                                            fontSize: 20,
                                                            display: 'block',
                                                            margin: 'auto',
                                                        }}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </StyledEnvTable>
                </>
            )}
        </>
    );
};
