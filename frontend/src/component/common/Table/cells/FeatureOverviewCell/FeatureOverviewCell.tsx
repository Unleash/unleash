import type { FC, ReactElement } from 'react';
import type { FeatureSearchResponseSchema } from '../../../../../openapi';
import { Box, IconButton, styled } from '@mui/material';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { useSearchHighlightContext } from '../../SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from '../../../Highlighter/Highlighter';
import { StyledDescription, StyledTitle } from '../LinkCell/LinkCell.styles';
import { Link } from 'react-router-dom';
import { Badge } from '../../../Badge/Badge';
import { HtmlTooltip } from '../../../HtmlTooltip/HtmlTooltip';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

interface IFeatureNameCellProps {
    row: {
        original: Pick<
            FeatureSearchResponseSchema,
            | 'name'
            | 'description'
            | 'project'
            | 'tags'
            | 'type'
            | 'dependencyType'
        >;
    };
}

const StyledFeatureLink = styled(Link)({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
});

const Tag = styled('button')(({ theme }) => ({
    marginRight: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallerBody,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textWrap: 'nowrap',
    maxWidth: '250px',
    padding: theme.spacing(0.25, 0.5),
    cursor: 'pointer',
    background: 'inherit',
    color: 'inherit',
}));

const CappedDescription: FC<{ text: string; searchQuery: string }> = ({
    text,
    searchQuery,
}) => {
    return (
        <ConditionallyRender
            condition={Boolean(text && text.length > 40)}
            show={
                <HtmlTooltip
                    title={
                        <Highlighter search={searchQuery}>{text}</Highlighter>
                    }
                    placement='bottom-start'
                    arrow
                >
                    <StyledDescription>
                        <Highlighter search={searchQuery}>{text}</Highlighter>
                    </StyledDescription>
                </HtmlTooltip>
            }
            elseShow={
                <StyledDescription>
                    <Highlighter search={searchQuery}>{text}</Highlighter>
                </StyledDescription>
            }
        />
    );
};

const CappedTag: FC<{ tag: string; children: ReactElement }> = ({
    tag,
    children,
}) => {
    return (
        <ConditionallyRender
            condition={tag.length > 30}
            show={<HtmlTooltip title={tag}>{children}</HtmlTooltip>}
            elseShow={children}
        />
    );
};

const Container = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    margin: theme.spacing(1.25, 0, 1, 0),
    paddingLeft: theme.spacing(2),
}));

const FeatureNameAndType = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.dark,
}));

const TagsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.25),
}));

const DependencyBadge = styled(Badge)(({ theme }) => ({
    padding: theme.spacing(0.5),
    border: 0,
    textTransform: 'capitalize',
}));

const FeatureName: FC<{
    project: string;
    feature: string;
    searchQuery: string;
}> = ({ project, feature, searchQuery }) => {
    return (
        <Box sx={(theme) => ({ fontWeight: theme.typography.fontWeightBold })}>
            <StyledFeatureLink to={`/projects/${project}/features/${feature}`}>
                <StyledTitle
                    style={{
                        WebkitLineClamp: 1,
                        lineClamp: 1,
                    }}
                >
                    <Highlighter search={searchQuery}>{feature}</Highlighter>
                </StyledTitle>
            </StyledFeatureLink>
        </Box>
    );
};

const RestTags: FC<{ tags: string[]; onClick: (tag: string) => void }> = ({
    tags,
    onClick,
}) => {
    return (
        <HtmlTooltip
            title={tags.map((tag) => (
                <Box
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onClick(tag)}
                    key={tag}
                >
                    {tag}
                </Box>
            ))}
        >
            <Tag sx={{ cursor: 'initial' }}>{tags.length} more...</Tag>
        </HtmlTooltip>
    );
};

const Tags: FC<{
    tags: FeatureSearchResponseSchema['tags'];
    onClick: (tag: string) => void;
}> = ({ tags, onClick }) => {
    const [tag1, tag2, tag3, ...restTags] = (tags || []).map(
        ({ type, value }) => `${type}:${value}`,
    );

    return (
        <TagsContainer>
            {tag1 && (
                <CappedTag tag={tag1}>
                    <Tag onClick={() => onClick(tag1)}>{tag1}</Tag>
                </CappedTag>
            )}
            {tag2 && (
                <CappedTag tag={tag2}>
                    <Tag onClick={() => onClick(tag2)}>{tag2}</Tag>
                </CappedTag>
            )}
            {tag3 && (
                <CappedTag tag={tag3}>
                    <Tag onClick={() => onClick(tag3)}>{tag3}</Tag>
                </CappedTag>
            )}
            <ConditionallyRender
                condition={restTags.length > 0}
                show={<RestTags tags={restTags} onClick={onClick} />}
            />
        </TagsContainer>
    );
};

const StyledDependencyLink = styled(Link)({
    display: 'block',
});

const DependencyPreview: FC<{ feature: string; project: string }> = ({
    feature,
    project,
}) => {
    const { feature: fetchedFeature } = useFeature(project, feature);
    const children = fetchedFeature.children;
    const parents = fetchedFeature.dependencies;

    if (children.length > 0) {
        return (
            <>
                <Box>Children</Box>

                {children.map((child) => (
                    <StyledDependencyLink
                        to={`/projects/${project}/features/${child}`}
                        key={child}
                    >
                        {child}
                    </StyledDependencyLink>
                ))}
            </>
        );
    } else if (parents[0]) {
        const parentFeature = parents[0].feature;
        return (
            <>
                <Box>Parent</Box>
                <Link to={`/projects/${project}/features/${parentFeature}`}>
                    {parentFeature}
                </Link>
            </>
        );
    }
    return <>Loading...</>;
};

export const PrimaryFeatureInfo: FC<{
    project: string;
    feature: string;
    searchQuery: string;
    type: string;
    dependencyType: string;
    onTypeClick: (type: string) => void;
    delay?: number;
}> = ({
    project,
    feature,
    type,
    searchQuery,
    dependencyType,
    onTypeClick,
    delay = 500,
}) => {
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);
    const typeName = featureTypes.find(
        (featureType) => featureType.id === type,
    )?.name;
    const title = `${typeName || type} flag`;

    const TypeIcon = () => (
        <HtmlTooltip arrow title={title} describeChild>
            <IconButton
                sx={{ p: 0 }}
                aria-label={`add ${type} flag to filter`}
                onClick={() => onTypeClick(type)}
            >
                <IconComponent
                    sx={(theme) => ({ fontSize: theme.spacing(2) })}
                    data-testid='feature-type-icon'
                />
            </IconButton>
        </HtmlTooltip>
    );

    return (
        <FeatureNameAndType data-loading>
            <TypeIcon />
            <FeatureName
                project={project}
                feature={feature}
                searchQuery={searchQuery}
            />
            <ConditionallyRender
                condition={Boolean(dependencyType)}
                show={
                    <HtmlTooltip
                        title={
                            <DependencyPreview
                                feature={feature}
                                project={project}
                            />
                        }
                        enterDelay={delay}
                        enterNextDelay={delay}
                    >
                        <DependencyBadge
                            color={
                                dependencyType === 'parent'
                                    ? 'warning'
                                    : 'secondary'
                            }
                        >
                            {dependencyType}
                        </DependencyBadge>
                    </HtmlTooltip>
                }
            />
        </FeatureNameAndType>
    );
};

const SecondaryFeatureInfo: FC<{
    description: string;
    searchQuery: string;
}> = ({ description, searchQuery }) => {
    return (
        <ConditionallyRender
            condition={Boolean(description)}
            show={
                <Box
                    sx={(theme) => ({ display: 'flex', gap: theme.spacing(1) })}
                >
                    <CappedDescription
                        text={description}
                        searchQuery={searchQuery}
                    />
                </Box>
            }
        />
    );
};

export const FeatureOverviewCell =
    (
        onTagClick: (tag: string) => void,
        onFlagTypeClick: (type: string) => void,
    ): FC<IFeatureNameCellProps> =>
    ({ row }) => {
        const { searchQuery } = useSearchHighlightContext();

        return (
            <Container>
                <PrimaryFeatureInfo
                    project={row.original.project || ''}
                    feature={row.original.name}
                    searchQuery={searchQuery}
                    type={row.original.type || ''}
                    dependencyType={row.original.dependencyType || ''}
                    onTypeClick={onFlagTypeClick}
                />
                <SecondaryFeatureInfo
                    description={row.original.description || ''}
                    searchQuery={searchQuery}
                />
                <Tags tags={row.original.tags} onClick={onTagClick} />
            </Container>
        );
    };
