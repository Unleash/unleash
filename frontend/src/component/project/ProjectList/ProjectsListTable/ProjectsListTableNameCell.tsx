import { IconButton, styled } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ProjectModeBadge } from 'component/project/ProjectCard/ProjectModeBadge/ProjectModeBadge';
import type { ProjectSchema } from 'openapi';
import { Link } from 'react-router-dom';

const StyledCellContainer = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
}));

const StyledFeatureLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const InlineFavoriteButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    padding: 0,
    fontSize: '0.875rem',
}));

const InlineFavoriteButtonInactive = styled(InlineFavoriteButton)({
    opacity: 0,
    '&:focus': { opacity: 1 },
    '&:active': { opacity: 1 },
});

type ProjectsListTableNameCellProps = {
    row: {
        original: ProjectSchema;
    };
    isFavorite?: boolean;
    onFavorite?: () => void;
};

export const ProjectsListTableNameCell = ({
    row,
    isFavorite,
    onFavorite,
}: ProjectsListTableNameCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    const FavoriteButton = () => {
        if (!onFavorite) return null;
        if (isFavorite) {
            return (
                <InlineFavoriteButton
                    size='small'
                    aria-label='Remove from favorites'
                    onClick={(e) => {
                        e.preventDefault();
                        onFavorite();
                    }}
                >
                    <StarIcon sx={{ fontSize: 'inherit' }} />
                </InlineFavoriteButton>
            );
        }
        return (
            <InlineFavoriteButtonInactive
                className='show-row-hover'
                size='small'
                aria-label='Add to favorites'
                onClick={(e) => {
                    e.preventDefault();
                    onFavorite();
                }}
            >
                <StarBorderIcon sx={{ fontSize: 'inherit' }} />
            </InlineFavoriteButtonInactive>
        );
    };

    return (
        <StyledCellContainer>
            <ProjectModeBadge mode={row.original.mode} />
            <StyledFeatureLink to={`/projects/${row.original.id}`}>
                <Truncator title={row.original.name} lines={2} arrow>
                    <Highlighter search={searchQuery}>
                        {row.original.name}
                    </Highlighter>
                </Truncator>
            </StyledFeatureLink>
            <FavoriteButton />
        </StyledCellContainer>
    );
};
