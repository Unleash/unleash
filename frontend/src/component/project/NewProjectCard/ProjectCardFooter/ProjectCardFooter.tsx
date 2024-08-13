import type React from 'react';
import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import useToast from 'hooks/useToast';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

interface IProjectCardFooterProps {
    id: string;
    isFavorite?: boolean;
    children?: React.ReactNode;
    Actions?: FC<{ id: string; isFavorite?: boolean }>;
    disabled?: boolean;
}

const StyledFooter = styled(Box)<{ disabled: boolean }>(
    ({ theme, disabled }) => ({
        display: 'flex',
        background: disabled
            ? theme.palette.background.paper
            : theme.palette.envAccordion.expanded,
        boxShadow: theme.boxShadows.accordionFooter,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${theme.palette.divider}`,
    }),
);

const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 0, 2.5, 3),
    display: 'flex',
    alignItems: 'center',
}));

const StyledFavoriteIconButton = styled(FavoriteIconButton)(({ theme }) => ({
    margin: theme.spacing(1, 2, 0, 0),
}));

const FavoriteAction: FC<{ id: string; isFavorite?: boolean }> = ({
    id,
    isFavorite,
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
        <StyledFavoriteIconButton
            onClick={onFavorite}
            isFavorite={Boolean(isFavorite)}
            size='medium'
        />
    );
};

export const ProjectCardFooter: FC<IProjectCardFooterProps> = ({
    children,
    id,
    isFavorite = false,
    Actions = FavoriteAction,
    disabled = false,
}) => {
    return (
        <StyledFooter disabled={disabled}>
            <StyledContainer>{children}</StyledContainer>
            <Actions id={id} isFavorite={isFavorite} />
        </StyledFooter>
    );
};
