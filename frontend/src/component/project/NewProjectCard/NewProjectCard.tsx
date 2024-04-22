import type React from 'react';
import { Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectEditPath } from 'utils/routePathHelpers';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DeleteProjectDialogue } from '../Project/DeleteProject/DeleteProjectDialogue';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledH2Title,
    StyledEditIcon,
    StyledDivInfo,
    StyledDivInfoContainer,
    StyledParagraphInfo,
    StyledProjectCardBody,
} from './NewProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectCardIcon } from './ProjectCardIcon/ProjectCardIcon';
import { ProjectOwners } from './ProjectOwners/ProjectOwners';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
    isFavorite?: boolean;
    mode: string;
    owners?: {
        users: any[];
        groups: any[];
    };
}

export const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
    id,
    mode,
    isFavorite = false,
    owners,
}: IProjectCardProps) => {
    const { isOss } = useUiConfig();
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const navigate = useNavigate();

    const handleClick = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    return (
        <StyledProjectCard onMouseEnter={onHover}>
            <StyledProjectCardBody>
                <StyledDivHeader data-loading>
                    <ProjectCardIcon mode={mode} />
                    <StyledBox>
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
                        id='project-card-menu'
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        style={{ top: 0, left: -100 }}
                        onClick={(event) => {
                            event.preventDefault();
                        }}
                        onClose={(event: SyntheticEvent) => {
                            event.preventDefault();
                            setAnchorEl(null);
                        }}
                    >
                        <MenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(getProjectEditPath(id));
                            }}
                        >
                            <StyledEditIcon />
                            Edit project
                        </MenuItem>
                    </Menu>
                </StyledDivHeader>
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
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} isFavorite={isFavorite}>
                <ProjectOwners owners={owners} />
            </ProjectCardFooter>
            <DeleteProjectDialogue
                project={id}
                open={showDelDialog}
                onClose={(e) => {
                    e.preventDefault();
                    setAnchorEl(null);
                    setShowDelDialog(false);
                }}
            />
        </StyledProjectCard>
    );
};
