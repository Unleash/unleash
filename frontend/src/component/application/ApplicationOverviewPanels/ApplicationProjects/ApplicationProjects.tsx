import { useId, useMemo } from 'react';
import {
    Link,
    styled,
    Table,
    TableBody,
    TableCell,
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
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { isTokenExpired } from '../../isTokenExpired.ts';
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

const StyledCoveredCheck = styled(Check)(({ theme }) => ({
    color: theme.palette.success.containerBorder,
}));

const StyledCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(2),
    '&.MuiTableCell-head': {
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.text.secondary,
    },
    '&:first-of-type': {
        paddingLeft: theme.spacing(3),
    },
    '&:last-of-type': {
        paddingRight: theme.spacing(3),
    },
}));

const StyledAllProjectsRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledTokenNames = styled('span')(({ theme }) => ({
    fontFamily: 'monospace',
    fontSize: theme.fontSizes.smallBody,
}));

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });

const linkedLabel = 'In a linked token';
const coveredLabel = 'Covered by "All projects"';
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
    const allProjectsTokens = useMemo(
        () => [
            ...new Set(
                environments
                    .flatMap((environment) => environment.tokens)
                    .filter(
                        (token) =>
                            !isTokenExpired(token) &&
                            token.projects.includes(ALL_PROJECTS),
                    )
                    .map((token) => token.tokenName),
            ),
        ],
        [environments],
    );
    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Project',
                cell: ({ getValue }) =>
                    getValue() === ALL_PROJECTS ? (
                        <strong>All projects</strong>
                    ) : (
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
                        if (row.original.coveredEnvironments.includes(name)) {
                            return (
                                <StyledCoveredCheck
                                    fontSize='small'
                                    titleAccess={coveredLabel}
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
                cell: ({ row, getValue }) => {
                    if (row.original.name === ALL_PROJECTS) {
                        return (
                            <>
                                From{' '}
                                <StyledTokenNames>
                                    {allProjectsTokens.join(', ')}
                                </StyledTokenNames>
                            </>
                        );
                    }
                    return getValue()
                        ? 'Flags evaluated recently'
                        : "No recent usage · not a signal it's safe to remove";
                },
            }),
        ],
        [environments, allProjectsTokens],
    );
    const table = useReactTable({
        data: projects,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (project) => project.name,
    });

    const listedCount = projects.filter(
        (project) => project.name !== ALL_PROJECTS,
    ).length;
    const observedCount = projects.filter((project) => project.observed).length;
    // the all-projects row already knows where a token reads everything
    const allProjectsEnvironments = (
        projects.find((project) => project.name === ALL_PROJECTS)
            ?.linkedEnvironments ?? []
    ).map(capitalizeFirst);
    const allProjectsNote =
        allProjectsEnvironments.length > 0
            ? `${listFormat.format(allProjectsEnvironments)} tokens can read all projects, so only projects in use are listed.`
            : undefined;

    const empty = listedCount === 0;
    const summary =
        allProjectsEnvironments.length > 0
            ? `All projects available in ${listFormat.format(allProjectsEnvironments)} · ${listedCount} listed · ${observedCount} with observed usage`
            : `${pluralize(listedCount, 'project')} · ${observedCount} with observed usage`;
    // nothing is said about tokens the viewer can't see
    const emptySubtitle = allTokensVisible
        ? "Projects this application's tokens can read, and projects its SDKs use."
        : "Projects this application's SDKs use.";
    const anyLinkedCell = projects.some(
        (project) => project.linkedEnvironments.length > 0,
    );
    const anyObservedCell = projects.some(
        (project) => project.observedEnvironments.length > 0,
    );

    return (
        <StyledPanel aria-labelledby={titleId}>
            <StyledHeader>
                <div>
                    <Typography variant='h3' id={titleId}>
                        Projects
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        {empty ? emptySubtitle : summary}
                    </Typography>
                </div>
                {!empty &&
                (anyLinkedCell || allProjectsNote || anyObservedCell) ? (
                    <StyledLegend aria-label='Legend'>
                        {anyLinkedCell ? (
                            <li>
                                <Check color='success' fontSize='small' />
                                {linkedLabel}
                            </li>
                        ) : null}
                        {allProjectsNote ? (
                            <li>
                                <StyledCoveredCheck fontSize='small' />
                                {coveredLabel}
                            </li>
                        ) : null}
                        {anyObservedCell ? (
                            <li>
                                <VisibilityOutlined
                                    color='action'
                                    fontSize='small'
                                />
                                {observedLabel}
                            </li>
                        ) : null}
                    </StyledLegend>
                ) : null}
            </StyledHeader>
            {empty ? (
                <StyledEmpty>
                    <StyledEmptyTitle>No projects yet</StyledEmptyTitle>
                    <Typography color='text.secondary'>
                        {allTokensVisible
                            ? 'Projects appear here when a token gives access to them or an SDK uses their flags.'
                            : 'Projects appear here when an SDK uses their flags.'}
                    </Typography>
                    {allProjectsNote ? (
                        <StyledEmptyNote variant='body2' color='text.secondary'>
                            {allProjectsNote}
                        </StyledEmptyNote>
                    ) : null}
                </StyledEmpty>
            ) : (
                <>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {table.getFlatHeaders().map((header) => (
                                    <StyledCell key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </StyledCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => {
                                const Row =
                                    row.original.name === ALL_PROJECTS
                                        ? StyledAllProjectsRow
                                        : TableRow;
                                return (
                                    <Row key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <StyledCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </StyledCell>
                                        ))}
                                    </Row>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {allProjectsNote ? (
                        <StyledNote variant='body2' color='text.secondary'>
                            {allProjectsNote}
                        </StyledNote>
                    ) : null}
                </>
            )}
        </StyledPanel>
    );
};
