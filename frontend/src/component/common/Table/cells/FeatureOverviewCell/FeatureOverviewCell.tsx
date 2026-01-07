import type { FC } from 'react';
import type { FeatureSearchResponseSchema, TagSchema } from 'openapi';
import { Box, IconButton, styled, Chip } from '@mui/material';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { useSearchHighlightContext } from '../../SearchHighlightContext/SearchHighlightContext.tsx';
import { Highlighter } from '../../../Highlighter/Highlighter.tsx';
import { StyledDescription } from '../LinkCell/LinkCell.styles';
import { Link } from 'react-router-dom';
import { Badge } from '../../../Badge/Badge.tsx';
import { HtmlTooltip } from '../../../HtmlTooltip/HtmlTooltip.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { getLocalizedDateString } from '../../../util.ts';
import { Tag } from 'component/common/Tag/Tag';
import { formatTag } from 'utils/format-tag';
import { Truncator } from 'component/common/Truncator/Truncator';

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
            | 'archivedAt'
        >;
    };
}

const StyledFeatureLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const CustomTagButton = styled('button')(({ theme }) => ({
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

const _StyledTag = styled(Chip)(({ theme }) => ({
    overflowWrap: 'anywhere',
    lineHeight: theme.typography.body1.lineHeight,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.25, 0.5),
    height: 'auto',
    fontSize: theme.fontSizes.smallerBody,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    '& .MuiChip-label': {
        padding: 0,
    },
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
                    <StyledDescription data-loading>
                        <Highlighter search={searchQuery}>{text}</Highlighter>
                    </StyledDescription>
                </HtmlTooltip>
            }
            elseShow={
                <StyledDescription data-loading>
                    <Highlighter search={searchQuery}>{text}</Highlighter>
                </StyledDescription>
            }
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
                <Truncator
                    lines={1}
                    title={feature}
                    arrow
                    sx={{
                        overflowWrap: 'anywhere',
                    }}
                >
                    <span>
                        <Highlighter search={searchQuery}>
                            {feature}
                        </Highlighter>
                    </span>
                </Truncator>
            </StyledFeatureLink>
        </Box>
    );
};

const ArchivedFeatureName: FC<{
    feature: string;
    searchQuery: string;
}> = ({ feature, searchQuery }) => {
    return (
        <Truncator
            lines={1}
            title={feature}
            arrow
            sx={(theme) => ({
                fontWeight: theme.typography.fontWeightBold,
                color: theme.palette.neutral.main,
                overflowWrap: 'anywhere',
            })}
        >
            <Highlighter search={searchQuery}>{feature}</Highlighter>
        </Truncator>
    );
};

interface ITagItemProps {
    tag: TagSchema;
    onClick: (tag: TagSchema) => void;
}

const TagItem: FC<ITagItemProps> = ({ tag, onClick }) => {
    const tagFullText = formatTag(tag);

    const tagComponent = (
        <Box onClick={() => onClick(tag)} sx={{ cursor: 'pointer' }}>
            <Tag tag={tag} maxLength={30} />
        </Box>
    );

    return (
        <HtmlTooltip key={tagFullText} title={tagFullText} arrow>
            <span>{tagComponent}</span>
        </HtmlTooltip>
    );
};

const RestTags: FC<{
    tags: TagSchema[];
    onClick: (tag: string) => void;
}> = ({ tags, onClick }) => {
    return (
        <HtmlTooltip
            title={tags.map((tag) => {
                const formattedTag = formatTag(tag);
                return (
                    <Box
                        sx={{ cursor: 'pointer' }}
                        onClick={() => onClick(formattedTag)}
                        key={formattedTag}
                    >
                        <Tag tag={tag} maxLength={30} />
                    </Box>
                );
            })}
        >
            <CustomTagButton
                sx={{
                    cursor: 'initial',
                    borderRadius: (theme) => theme.spacing(2),
                }}
            >
                {tags.length} more...
            </CustomTagButton>
        </HtmlTooltip>
    );
};

const Tags: FC<{
    tags: FeatureSearchResponseSchema['tags'];
    onClick: (tag: string) => void;
}> = ({ tags, onClick }) => {
    if (!tags || tags.length === 0) {
        return null;
    }

    const [tag1, tag2, tag3, ...restTags] = tags;

    const handleTagClick = (tag: TagSchema) => {
        onClick(formatTag(tag));
    };

    return (
        <TagsContainer>
            {tag1 && <TagItem tag={tag1} onClick={handleTagClick} />}
            {tag2 && <TagItem tag={tag2} onClick={handleTagClick} />}
            {tag3 && <TagItem tag={tag3} onClick={handleTagClick} />}
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
    archivedAt: string | null;
    searchQuery: string;
    type: string;
    dependencyType: string;
    onTypeClick: (type: string) => void;
    delay?: number;
}> = ({
    project,
    feature,
    archivedAt,
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
    const { locationSettings } = useLocationSettings();
    const archivedDate = getLocalizedDateString(
        archivedAt,
        locationSettings.locale,
    );

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
            {archivedAt ? (
                <ArchivedFeatureName
                    feature={feature}
                    searchQuery={searchQuery}
                />
            ) : (
                <FeatureName
                    project={project}
                    feature={feature}
                    searchQuery={searchQuery}
                />
            )}

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
            {archivedAt && (
                <HtmlTooltip arrow title={archivedDate} describeChild>
                    <Badge tabIndex={0} color='neutral'>
                        Archived
                    </Badge>
                </HtmlTooltip>
            )}
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

export const createFeatureOverviewCell =
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
                    archivedAt={row.original.archivedAt}
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
