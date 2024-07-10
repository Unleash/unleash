import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Fragment, type FC } from 'react';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.links,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
}));
const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
    color: theme.palette.error.main,
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
}));

const StyledContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

interface IProjectsListProps {
    project?: string;
    projects?: string | string[];
    isWildcard?: boolean;
    isLegacy?: boolean;
}

export const ProjectsList: FC<IProjectsListProps> = ({
    projects,
    project,
    isWildcard,
    isLegacy,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const projectsList =
        projects && Array.isArray(projects) && projects.length > 1
            ? projects
            : [];

    if (projectsList.length > 0) {
        return (
            <TextCell>
                <HtmlTooltip
                    title={projectsList.map((item, index) => (
                        <Fragment key={item}>
                            {index > 0 && ', '}
                            {!item || item === '*' ? (
                                <Highlighter search={searchQuery}>
                                    *
                                </Highlighter>
                            ) : (
                                <StyledLink to={`/projects/${item}`}>
                                    <Highlighter search={searchQuery}>
                                        {item}
                                    </Highlighter>
                                </StyledLink>
                            )}
                        </Fragment>
                    ))}
                    placement='bottom-start'
                    arrow
                    tabIndex={0}
                >
                    <span>{`${projectsList.length}`} projects</span>
                </HtmlTooltip>
            </TextCell>
        );
    }

    if (
        (projectsList.length === 1 && projectsList[0] !== '*') ||
        (project && project !== '*')
    ) {
        const item = project || projectsList[0];

        return <LinkCell to={`/projects/${item}`} title={item} />;
    }

    const getTitle = () => {
        if (!isWildcard && !isLegacy) {
            return (
                <>
                    ALL current and future projects. This is an orphaned token
                    with it's project deleted.
                    {/* FIXME: more actionable info */}
                </>
            );
        }

        if (isLegacy) {
            return (
                <>
                    ALL current and future projects. This token has v1 format.
                    Read more about{' '}
                    <a href='https://docs.getunleash.io/reference/api-tokens-and-client-keys#format'>
                        token formats
                    </a>
                    .
                </>
            );
        }

        return 'All projects';
    };

    return (
        <TextCell>
            <HtmlTooltip title={getTitle()} placement='bottom' arrow>
                <StyledContainer>
                    <Highlighter search={searchQuery}>*</Highlighter>
                    {!isWildcard && !isLegacy && <StyledErrorIcon />}
                    {isLegacy && <StyledWarningIcon />}
                </StyledContainer>
            </HtmlTooltip>
        </TextCell>
    );
};
