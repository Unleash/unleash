import { Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { SyntheticEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectEditPath } from 'utils/routePathHelpers';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';
import { DeleteProjectDialogue } from '../Project/DeleteProject/DeleteProjectDialogue';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledH2Title,
    StyledEditIcon,
    StyledDeleteIcon,
    StyledProjectIcon,
    StyledDivInfo,
    StyledDivInfoContainer,
    StyledParagraphInfo,
} from './ProjectCard.styles';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
    isFavorite?: boolean;
}

export const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
    id,
    isFavorite = false,
}: IProjectCardProps) => {
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const navigate = useNavigate();
    const { favorite, unfavorite } = useFavoriteProjectsApi();
    const { refetch } = useProjects();

    const handleClick = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    const canDeleteProject =
        hasAccess(DELETE_PROJECT, id) && id !== DEFAULT_PROJECT_ID;

    const onFavorite = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (isFavorite) {
            await unfavorite(id);
        } else {
            await favorite(id);
        }
        refetch();
    };

    return (
        <StyledProjectCard onMouseEnter={onHover}>
            <StyledDivHeader data-loading>
                <StyledBox>
                    <FavoriteIconButton
                        onClick={onFavorite}
                        isFavorite={isFavorite}
                        size="medium"
                        sx={{ ml: -1 }}
                    />
                    <StyledH2Title>{name}</StyledH2Title>
                </StyledBox>

                <PermissionIconButton
                    style={{ transform: 'translateX(7px)' }}
                    permission={UPDATE_PROJECT}
                    hidden={isOss()}
                    projectId={id}
                    data-loading
                    onClick={handleClick}
                    tooltipProps={{
                        title: 'Options',
                    }}
                >
                    <MoreVertIcon />
                </PermissionIconButton>

                <Menu
                    id="project-card-menu"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    style={{ top: 0, left: -100 }}
                    onClick={event => {
                        event.preventDefault();
                    }}
                    onClose={(event: SyntheticEvent) => {
                        event.preventDefault();
                        setAnchorEl(null);
                    }}
                >
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            navigate(getProjectEditPath(id));
                        }}
                    >
                        <StyledEditIcon />
                        Edit project
                    </MenuItem>
                    <MenuItem
                        onClick={e => {
                            e.preventDefault();
                            setShowDelDialog(true);
                        }}
                        disabled={!canDeleteProject}
                    >
                        <StyledDeleteIcon />
                        {id === DEFAULT_PROJECT_ID && !canDeleteProject
                            ? "You can't delete the default project"
                            : 'Delete project'}
                    </MenuItem>
                </Menu>
            </StyledDivHeader>
            <div data-loading>
                <StyledProjectIcon />
            </div>
            <StyledDivInfo>
                <StyledDivInfoContainer>
                    <StyledParagraphInfo data-loading>
                        {featureCount}
                    </StyledParagraphInfo>
                    <p data-loading>toggles</p>
                </StyledDivInfoContainer>
                <StyledDivInfoContainer>
                    <StyledParagraphInfo data-loading>
                        {health}%
                    </StyledParagraphInfo>
                    <p data-loading>health</p>
                </StyledDivInfoContainer>

                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <StyledDivInfoContainer>
                            <StyledParagraphInfo data-loading>
                                {memberCount}
                            </StyledParagraphInfo>
                            <p data-loading>members</p>
                        </StyledDivInfoContainer>
                    }
                />
            </StyledDivInfo>
            <DeleteProjectDialogue
                project={id}
                open={showDelDialog}
                onClose={() => {
                    setAnchorEl(null);
                    setShowDelDialog(false);
                }}
            />
        </StyledProjectCard>
    );
};
