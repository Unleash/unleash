import { Fragment, type FC } from 'react';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import ErrorIcon from '@mui/icons-material/Error';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.links,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
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
    secret?: string;
}

export const ProjectsList: FC<IProjectsListProps> = ({
    projects,
    project,
    secret,
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

    const tokenFormat = secret?.includes(':') ? 'v2' : 'v1'; // see https://docs.getunleash.io/reference/api-tokens-and-client-keys#format
    const isWildcardToken = secret?.startsWith('*:');
    const isOrphanedToken = tokenFormat === 'v2' && !isWildcardToken;

    return (
        <TextCell>
            <HtmlTooltip
                title={
                    isOrphanedToken ? (
                        <>
                            This is an orphaned token. All of its original
                            projects have been deleted and it now has access to
                            all current and future projects. You should stop
                            using this token and delete it. It will lose access
                            to all projects at a later date.
                        </>
                    ) : (
                        'ALL current and future projects.'
                    )
                }
                placement='bottom'
                arrow
            >
                <StyledContainer>
                    <Highlighter search={searchQuery}>*</Highlighter>
                    <ConditionallyRender
                        condition={isOrphanedToken}
                        show={<StyledErrorIcon aria-label='Orphaned token' />}
                    />
                </StyledContainer>
            </HtmlTooltip>
        </TextCell>
    );
};
