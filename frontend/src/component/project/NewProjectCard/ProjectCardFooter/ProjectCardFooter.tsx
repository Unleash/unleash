import type { FC } from 'react';
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
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: theme.spacing(1.5, 3, 2, 3),
    background: theme.palette.envAccordion.expanded,
    boxShadow: theme.boxShadows.accordionFooter,
}));

const StyledFavoriteIconButton = styled(FavoriteIconButton)(({ theme }) => ({
    marginRight: theme.spacing(-1),
    marginLeft: 'auto',
}));

export const ProjectCardFooter: FC<IProjectCardFooterProps> = ({
    children,
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
            {children}
            <StyledFavoriteIconButton
                onClick={onFavorite}
                isFavorite={isFavorite}
                size='medium'
            />
        </StyledFooter>
    );
};
