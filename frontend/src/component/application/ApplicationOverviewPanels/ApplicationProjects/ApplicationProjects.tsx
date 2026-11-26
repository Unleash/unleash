import { useId, useMemo } from 'react';
import {
    Link,
    styled,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import Check from '@mui/icons-material/Check';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Link as RouterLink } from 'react-router';
import { TableCell } from 'component/common/Table';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { pluralize } from '../../pluralize.ts';
import {
    ALL_PROJECTS,
    type IApplicationEnvironment,
} from '../buildApplicationEnvironments.ts';
import {
    buildApplicationProjects,
    type IApplicationProject,
} from './buildApplicationProjects.ts';

const StyledPanel = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto',
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledLegend = styled('ul')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    margin: 0,
    padding: 0,
    listStyle: 'none',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    '& li': {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.75),
    },
}));

const StyledProjectLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
})) as typeof Link;

const StyledNote = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(2, 3),
}));

const StyledEmpty = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(4, 3),
    textAlign: 'center',
}));

const StyledEmptyTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledEmptyNote = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

const linkedLabel = 'In a linked token';
const observedLabel = 'Observed only';

const columnHelper = createColumnHelper<IApplicationProject>();

interface IApplicationProjectsProps {
    environments: IApplicationEnvironment[];
    // projects seen in SDK metrics, for the whole application
    observedProjects: string[];
    // false when the viewer can't read every token type, or the tokens failed to load
    allTokensVisible: boolean;
}

export const ApplicationProjects = ({
    environments: allEnvironments,
    observedProjects,
    allTokensVisible,
}: IApplicationProjectsProps) => {
    const titleId = useId();
    // where a project is linked is only known when every token is visible
    const environments = useMemo(
        () => (allTokensVisible ? allEnvironments : []),
        [allEnvironments, allTokensVisible],
    );
    const projects = useMemo(
        () => buildApplicationProjects(environments, observedProjects),
        [environments, observedProjects],
    );
    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Project',
                cell: ({ getValue }) => (
                    <StyledProjectLink
                        component={RouterLink}
                        to={`/projects/${getValue()}`}
                        underline='hover'
                    >
                        {getValue()}
                    </StyledProjectLink>
                ),
            }),
            ...environments.map(({ name }) =>
                columnHelper.display({
                    id: `environment-${name}`,
                    header: capitalizeFirst(name),
                    cell: ({ row }) => {
                        if (row.original.linkedEnvironments.includes(name)) {
                            return (
                                <Check
                                    color='success'
                                    fontSize='small'
                                    titleAccess={linkedLabel}
                                />
                            );
                        }
                        if (row.original.observedEnvironments.includes(name)) {
                            return (
                                <VisibilityOutlined
                                    color='action'
                                    fontSize='small'
                                    titleAccess={observedLabel}
                                />
                            );
                        }
                        return (
                            <>
                                <span aria-hidden>—</span>
                                <ScreenReaderOnly>
                                    Not in a linked token
                                </ScreenReaderOnly>
                            </>
                        );
                    },
                }),
            ),
            columnHelper.accessor('observed', {
                header: 'Observed usage',
                cell: ({ getValue }) =>
                    getValue()
                        ? 'Flags evaluated recently'
                        : "No recent usage · not a signal it's safe to remove",
            }),
        ],
        [environments],
    );
    const table = useReactTable({
        data: projects,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (project) => project.name,
    });

    const observedCount = projects.filter((project) => project.observed).length;
    const allProjectsEnvironments = environments
        .filter((e) => e.linkedProjects.includes(ALL_PROJECTS))
        .map((e) => capitalizeFirst(e.name));
    const allProjectsNote =
        allProjectsEnvironments.length > 0
            ? `${allProjectsEnvironments.join(', ')} tokens can read all projects, so only projects in use are listed.`
            : undefined;
    const empty = projects.length === 0;

    return (
        <StyledPanel aria-labelledby={titleId}>
            <StyledHeader>
                <div>
                    <Typography variant='h3' id={titleId}>
                        Projects
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        {empty
                            ? "Projects this application's tokens can read, and projects its SDKs use."
                            : `${pluralize(projects.length, 'project')} · ${observedCount} with observed usage`}
                    </Typography>
                </div>
                {!empty && environments.length > 0 ? (
                    <StyledLegend aria-label='Legend'>
                        <li>
                            <Check color='success' fontSize='small' />
                            {linkedLabel}
                        </li>
                        <li>
                            <VisibilityOutlined
                                color='action'
                                fontSize='small'
                            />
                            {observedLabel}
                        </li>
                    </StyledLegend>
                ) : null}
            </StyledHeader>
            {empty ? null : (
                <Table>
                    <TableHead>
                        <TableRow>
                            {table.getFlatHeaders().map((header) => (
                                <TableCell key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {empty ? (
                <StyledEmpty>
                    <StyledEmptyTitle>No projects yet</StyledEmptyTitle>
                    <Typography color='text.secondary'>
                        Projects appear here when a token gives access to them
                        or an SDK uses their flags.
                    </Typography>
                    <StyledEmptyNote variant='body2' color='text.secondary'>
                        {allProjectsNote ??
                            'Development tokens can read all projects, so only projects in use are listed.'}
                    </StyledEmptyNote>
                </StyledEmpty>
            ) : null}
            {!empty && allProjectsNote ? (
                <StyledNote variant='body2' color='text.secondary'>
                    {allProjectsNote}
                </StyledNote>
            ) : null}
        </StyledPanel>
    );
};
