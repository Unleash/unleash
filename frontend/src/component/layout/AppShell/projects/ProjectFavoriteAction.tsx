import type { FC } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import type { ProjectSchema } from 'openapi';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import { SidebarRowAction } from '../sidebar/SidebarRowAction.tsx';

export const ProjectFavoriteAction: FC<{
    project: Pick<ProjectSchema, 'id' | 'name' | 'favorite'>;
}> = ({ project }) => {
    const { favorite, unfavorite } = useFavoriteProjectsApi();

    return project.favorite ? (
        <SidebarRowAction
            tooltip='Remove from favorites'
            label={`Remove ${project.name} from favorites`}
            icon={<StarIcon color='primary' />}
            onClick={() => unfavorite(project.id)}
        />
    ) : (
        <SidebarRowAction
            tooltip='Add to favorites'
            label={`Add ${project.name} to favorites`}
            icon={<StarBorderIcon />}
            onClick={() => favorite(project.id)}
        />
    );
};
