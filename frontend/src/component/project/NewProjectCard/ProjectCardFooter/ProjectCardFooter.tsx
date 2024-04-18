import type { VFC } from 'react';
import { Box, styled } from '@mui/material';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import useToast from 'hooks/useToast';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

interface IProjectCardFooterProps {
    id: string;
    isFavorite?: boolean;
}

const StyledFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.grey[100],
    boxShadow: 'inset 0px 2px 4px rgba(32, 32, 33, 0.05)', // FIXME: replace with variable
}));

const StyledFavoriteIconButton = styled(FavoriteIconButton)(({ theme }) => ({
    marginRight: theme.spacing(-1),
    marginLeft: 'auto',
}));

export const ProjectCardFooter: VFC<IProjectCardFooterProps> = ({
    id,
    isFavorite = false,
}) => {
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
        <StyledFooter>
            <StyledFavoriteIconButton
                onClick={onFavorite}
                isFavorite={isFavorite}
                size='medium'
            />
        </StyledFooter>
    );
};
