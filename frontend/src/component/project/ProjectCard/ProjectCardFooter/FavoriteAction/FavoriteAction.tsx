import type { FC } from 'react';
import useToast from 'hooks/useToast';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { styled } from '@mui/material';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';

type FavoriteActionProps = { id: string; isFavorite?: boolean };

const StyledFavoriteIconButton = styled(FavoriteIconButton)(({ theme }) => ({
    margin: theme.spacing(1, 2, 0, 0),
}));

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
        } catch (error) {
            setToastApiError('Something went wrong, could not update favorite');
        }
    };

    return (
        <StyledFavoriteIconButton
            onClick={onFavorite}
            isFavorite={Boolean(isFavorite)}
            size='medium'
        />
    );
};
