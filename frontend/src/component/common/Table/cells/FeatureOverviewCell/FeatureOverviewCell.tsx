import type { FC } from 'react';
import type { FeatureSearchResponseSchema } from '../../../../../openapi';
import { Box, styled } from '@mui/material';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { useSearchHighlightContext } from '../../SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from '../../../Highlighter/Highlighter';
import { StyledDescription, StyledTitle } from '../LinkCell/LinkCell.styles';
import { Link } from 'react-router-dom';
import { Badge } from '../../../Badge/Badge';
import { HtmlTooltip } from '../../../HtmlTooltip/HtmlTooltip';
import { ConditionallyRender } from '../../../ConditionallyRender/ConditionallyRender';

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

const Tag = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallerBody,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textWrap: 'nowrap',
    maxWidth: '250px',
    padding: theme.spacing(0.25, 0.5),
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

const CappedTag: FC<{ tag: string }> = ({ tag }) => {
    return (
        <ConditionallyRender
            condition={tag.length > 30}
            show={
                <HtmlTooltip title={tag}>
                    <Tag>{tag}</Tag>
                </HtmlTooltip>
            }
            elseShow={<Tag>{tag}</Tag>}
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

const RestTags: FC<{ tags: string[] }> = ({ tags }) => {
    return (
        <HtmlTooltip title={tags.map((tag) => <div key={tag}>{tag}</div>)}>
            <Tag>{tags.length} more...</Tag>
        </HtmlTooltip>
    );
};

const Tags: FC<{ tags: FeatureSearchResponseSchema['tags'] }> = ({ tags }) => {
    const [tag1, tag2, tag3, ...restTags] = (tags || []).map(
        ({ type, value }) => `${type}:${value}`,
    );

    return (
        <TagsContainer>
            {tag1 && <CappedTag tag={tag1} />}
            {tag2 && <CappedTag tag={tag2} />}
            {tag3 && <CappedTag tag={tag3} />}
            <ConditionallyRender
                condition={restTags.length > 0}
                show={<RestTags tags={restTags} />}
            />
        </TagsContainer>
    );
};

const PrimaryFeatureInfo: FC<{
    project: string;
    feature: string;
    searchQuery: string;
    type: string;
    dependencyType: string;
}> = ({ project, feature, type, searchQuery, dependencyType }) => {
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);
    const typeName = featureTypes.find(
        (featureType) => featureType.id === type,
    )?.name;
    const title = `${typeName || type} flag`;

    const TypeIcon = () => (
        <HtmlTooltip arrow title={title} describeChild>
            <IconComponent sx={(theme) => ({ fontSize: theme.spacing(2) })} />
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
                    <DependencyBadge
                        color={
                            dependencyType === 'parent'
                                ? 'warning'
                                : 'secondary'
                        }
                    >
                        {dependencyType}
                    </DependencyBadge>
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

export const FeatureOverviewCell: FC<IFeatureNameCellProps> = ({ row }) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <Container>
            <PrimaryFeatureInfo
                project={row.original.project || ''}
                feature={row.original.name}
                searchQuery={searchQuery}
                type={row.original.type || ''}
                dependencyType={row.original.dependencyType || ''}
            />
            <SecondaryFeatureInfo
                description={row.original.description || ''}
                searchQuery={searchQuery}
            />
            <Tags tags={row.original.tags} />
        </Container>
    );
};
