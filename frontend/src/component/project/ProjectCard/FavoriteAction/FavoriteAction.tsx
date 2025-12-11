import type { FC } from 'react';
import useToast from 'hooks/useToast';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';

type FavoriteActionProps = { id: string; isFavorite?: boolean };

export const FavoriteAction: FC<FavoriteActionProps> = ({ id, isFavorite }) => {
    const { setToastApiError } = useToast();
    const { favorite, unfavorite } = useFavoriteProjectsApi();
    const { refetch } = useProjects();

    const onFavorite = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            if (isFavorite) {
                await unfavorite(id);
            } else {
                await favorite(id);
            }
            refetch();
        } catch (_error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
    };

    return (
        <FavoriteIconButton
            onClick={onFavorite}
            isFavorite={Boolean(isFavorite)}
            size='medium'
        />
    );
};
