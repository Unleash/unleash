import { useId } from 'react';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import type { ApiTokenSchema } from 'openapi';
import { Badge } from 'component/common/Badge/Badge';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { CreateApplicationTokenButton } from '../../ApplicationApiTokens/CreateApplicationTokenButton/CreateApplicationTokenButton.tsx';
import { pluralize } from '../../pluralize.ts';
import { isTokenExpired } from '../../isTokenExpired.ts';
import {
    ALL_PROJECTS,
    type IApplicationEnvironment,
} from '../buildApplicationEnvironments.ts';

const MAX_TOKENS_SHOWN = 5;

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });

const StyledGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${theme.spacing(40)}), 1fr))`,
    gap: theme.spacing(3),
}));

const StyledCard = styled('section', {
    shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty: boolean }>(({ theme, empty }) => ({
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: 'span 4',
    rowGap: 0,
    minWidth: 0,
    border: `1px ${empty ? 'dashed' : 'solid'} ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

const StyledCardHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    minHeight: theme.spacing(9),
}));

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flex: '1 1 0',
    minWidth: 0,
}));

type Tone = 'success' | 'error' | 'warning' | 'info' | 'secondary';

const StyledDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: theme.palette[tone].main,
}));

const environmentTone = (type?: string): Tone => {
    if (type === 'production') {
        return 'warning';
    }
    if (type === 'development') {
        return 'info';
    }
    return 'secondary';
};

const StyledSection = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    minWidth: 0,
}));

const StyledList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    margin: 0,
    padding: 0,
    listStyle: 'none',
    '& > li': {
        minWidth: 0,
        overflowWrap: 'anywhere',
    },
}));

const StyledTokens = styled(StyledList)({
    flexDirection: 'column',
});

const StyledToken = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledTokenName = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledProjectsNote = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    overflowWrap: 'anywhere',
}));

interface ISectionTitleProps {
    children: string;
}

const SectionTitle = ({ children }: ISectionTitleProps) => (
    <Typography
        variant='overline'
        component='h5'
        color='text.secondary'
        gutterBottom
    >
        {children}
    </Typography>
);

type IEnvironmentTokensProps = Pick<IApplicationEnvironment, 'tokens'> &
    Pick<IEnvironmentCardProps, 'allTokensVisible' | 'tokensPath'> & {
        label: string;
    };

const EnvironmentTokens = ({
    tokens,
    allTokensVisible,
    tokensPath,
    label,
}: IEnvironmentTokensProps) => {
    if (tokens.length === 0) {
        return (
            <Typography>
                {allTokensVisible ? 'No linked token' : 'No token shown'}
            </Typography>
        );
    }

    const shownTokens = [
        ...tokens.filter((token) => !isTokenExpired(token)),
        ...tokens.filter(isTokenExpired),
    ].slice(0, MAX_TOKENS_SHOWN);
    const hiddenCount = tokens.length - shownTokens.length;

    return (
        <StyledTokens>
            {shownTokens.map((token, index) => (
                <StyledToken
                    // a viewer who can't see secrets may get two tokens with one name
                    key={token.secret ?? `${token.tokenName}-${index}`}
                >
                    <StyledTokenName>
                        <StyledDot
                            aria-hidden
                            tone={isTokenExpired(token) ? 'error' : 'success'}
                        />
                        {token.tokenName}
                        {isTokenExpired(token) ? (
                            <Badge color='error'>Expired</Badge>
                        ) : null}
                    </StyledTokenName>
                    <Typography variant='body2' color='text.secondary' noWrap>
                        <TimeAgo
                            date={token.seenAt}
                            fallback='Never used'
                            refresh={false}
                        />
                    </Typography>
                </StyledToken>
            ))}
            {hiddenCount > 0 ? (
                <li>
                    <Link component={RouterLink} to={tokensPath}>
                        +{hiddenCount} more
                        <ScreenReaderOnly as='span'>
                            {' '}
                            tokens in {label}
                        </ScreenReaderOnly>
                    </Link>
                </li>
            ) : null}
        </StyledTokens>
    );
};

const allProjectsNote = (
    tokens: ApiTokenSchema[],
    label: string,
    allTokensVisible: boolean,
) => {
    const workingTokens = tokens.filter((token) => !isTokenExpired(token));
    const namingTokens = workingTokens.filter(
        (token) => !token.projects.includes(ALL_PROJECTS),
    );
    const readingAll = workingTokens.length - namingTokens.length;
    if (!allTokensVisible || namingTokens.length === 0 || readingAll === 0) {
        return `All projects available in ${label}`;
    }
    const namedProjects = [
        ...new Set(namingTokens.flatMap((token) => token.projects)),
    ].sort((a, b) => a.localeCompare(b));

    return `${
        namingTokens.length === 1
            ? 'One token reads'
            : `${namingTokens.length} tokens read`
    } ${listFormat.format(namedProjects)}, ${
        readingAll === 1 ? 'another reads' : `${readingAll} others read`
    } all projects, so the card shows “All projects”.`;
};

type IEnvironmentProjectsProps = Pick<
    IApplicationEnvironment,
    'tokens' | 'linkedProjects' | 'observedProjects'
> &
    Pick<IEnvironmentCardProps, 'allTokensVisible'> & { label: string };

const EnvironmentProjects = ({
    tokens,
    linkedProjects,
    observedProjects,
    label,
    allTokensVisible,
}: IEnvironmentProjectsProps) => {
    if (linkedProjects.length + observedProjects.length === 0) {
        return (
            <Typography color='text.secondary'>
                <span aria-hidden>—</span>
                <ScreenReaderOnly as='span'>No projects</ScreenReaderOnly>
            </Typography>
        );
    }

    if (linkedProjects.includes(ALL_PROJECTS)) {
        return (
            <>
                <Badge color='secondary'>All projects</Badge>
                <StyledProjectsNote variant='body2' color='text.secondary'>
                    {allProjectsNote(tokens, label, allTokensVisible)}
                </StyledProjectsNote>
            </>
        );
    }

    return (
        <StyledList>
            {linkedProjects.map((project) => (
                <li key={project}>
                    <Link
                        component={RouterLink}
                        to={`/projects/${project}`}
                        underline='none'
                    >
                        <Badge color='secondary'>{project}</Badge>
                    </Link>
                </li>
            ))}
            {observedProjects.map((project) => (
                <li key={project}>
                    <Link
                        component={RouterLink}
                        to={`/projects/${project}`}
                        underline='none'
                    >
                        {/* dashed: seen in SDK metrics, not in a linked token */}
                        <Badge color='disabled' sx={{ borderStyle: 'dashed' }}>
                            {project} observed
                        </Badge>
                    </Link>
                </li>
            ))}
        </StyledList>
    );
};

interface IEnvironmentCardProps {
    environment: IApplicationEnvironment;
    // false when the viewer can't read every token type, or the tokens failed to load
    allTokensVisible: boolean;
    tokensPath: string;
    onCreateToken: (environment: string) => void;
}

const EnvironmentCard = ({
    environment: {
        name,
        enabled,
        type,
        instanceCount,
        lastSeen,
        tokens,
        linked,
        linkedProjects,
        observedProjects,
    },
    allTokensVisible,
    tokensPath,
    onCreateToken,
}: IEnvironmentCardProps) => {
    const titleId = useId();
    const label = capitalizeFirst(name);
    // one action per card: a first working token, else the tokens there are
    const canCreateToken = enabled && !linked;

    return (
        <StyledCard
            aria-labelledby={titleId}
            empty={instanceCount === 0 && tokens.length === 0}
        >
            <StyledCardHeader>
                <StyledTitle>
                    <StyledDot aria-hidden tone={environmentTone(type)} />
                    <Typography
                        variant='h3'
                        component='h4'
                        id={titleId}
                        title={label}
                        noWrap
                    >
                        {label}
                    </Typography>
                </StyledTitle>
                {canCreateToken ? (
                    <CreateApplicationTokenButton
                        onClick={() => onCreateToken(name)}
                    >
                        Create token
                        <ScreenReaderOnly as='span'>
                            {' '}
                            in {label}
                        </ScreenReaderOnly>
                    </CreateApplicationTokenButton>
                ) : null}
                {!canCreateToken && tokens.length > 0 ? (
                    <Link component={RouterLink} to={tokensPath} noWrap>
                        Manage tokens
                    </Link>
                ) : null}
            </StyledCardHeader>
            <StyledSection>
                <SectionTitle>Instances</SectionTitle>
                {instanceCount > 0 ? (
                    <Typography>
                        {pluralize(instanceCount, 'instance')}
                        {lastSeen ? (
                            <>
                                {' · last seen '}
                                <TimeAgo date={lastSeen} />
                            </>
                        ) : null}
                    </Typography>
                ) : (
                    <Typography>No instances reporting</Typography>
                )}
                {/* only certain when every token is visible */}
                {instanceCount > 0 &&
                tokens.length === 0 &&
                allTokensVisible ? (
                    <Typography variant='body2' color='text.secondary'>
                        Reported by the SDK's appName, without a linked token
                    </Typography>
                ) : null}
            </StyledSection>
            <StyledSection>
                <SectionTitle>Tokens</SectionTitle>
                <EnvironmentTokens
                    tokens={tokens}
                    allTokensVisible={allTokensVisible}
                    tokensPath={tokensPath}
                    label={label}
                />
            </StyledSection>
            <StyledSection>
                <SectionTitle>Projects</SectionTitle>
                <EnvironmentProjects
                    tokens={tokens}
                    label={label}
                    allTokensVisible={allTokensVisible}
                    linkedProjects={linkedProjects}
                    observedProjects={observedProjects}
                />
            </StyledSection>
        </StyledCard>
    );
};

interface IApplicationEnvironmentsProps
    extends Omit<IEnvironmentCardProps, 'environment'> {
    environments: IApplicationEnvironment[];
}

export const ApplicationEnvironments = ({
    environments,
    allTokensVisible,
    tokensPath,
    onCreateToken,
}: IApplicationEnvironmentsProps) => {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId}>
            <ScreenReaderOnly>
                <h3 id={headingId}>Environments</h3>
            </ScreenReaderOnly>
            <StyledGrid>
                {environments.map((environment) => (
                    <EnvironmentCard
                        key={environment.name}
                        environment={environment}
                        allTokensVisible={allTokensVisible}
                        tokensPath={tokensPath}
                        onCreateToken={onCreateToken}
                    />
                ))}
            </StyledGrid>
        </section>
    );
};
