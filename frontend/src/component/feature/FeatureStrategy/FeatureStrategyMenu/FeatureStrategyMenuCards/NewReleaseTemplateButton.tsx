import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useHasRootAccess } from 'hooks/useHasAccess.ts';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions.ts';
import { formatReleaseTemplateCreatePath } from 'component/releases/releaseTemplatePaths';
import { releaseTemplateScopeProps } from 'component/releases/releaseTemplateScopeProps';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import { Dialogue } from 'component/common/Dialogue/Dialogue.tsx';

interface INewReleaseTemplateButtonProps {
    projectId: string;
}

export const NewReleaseTemplateButton = ({
    projectId,
}: INewReleaseTemplateButtonProps) => {
    const { trackEvent } = useEventTracker();
    const [noAccessDialogOpen, setNoAccessDialogOpen] = useState(false);
    const canCreateGlobalTemplate = useHasRootAccess(
        RELEASE_PLAN_TEMPLATE_CREATE,
    );
    const canCreateProjectTemplate = useHasRootAccess(
        [RELEASE_PLAN_TEMPLATE_CREATE, UPDATE_PROJECT_RELEASE_TEMPLATE],
        projectId,
    );
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const handleNavigateToCreate = (project?: string) => {
        setMenuAnchor(null);
        trackEvent('new-template-from-add-strategy', {
            props: {
                eventType: 'navigate-to-create-template',
                ...releaseTemplateScopeProps(project),
            },
        });
    };

    const handleNoAccessClick = () => {
        setNoAccessDialogOpen(true);
        trackEvent('new-template-from-add-strategy', {
            props: {
                eventType: 'show-no-access-dialog',
            },
        });
    };

    if (!canCreateGlobalTemplate && !canCreateProjectTemplate) {
        return (
            <>
                <Button
                    startIcon={<AddIcon />}
                    onClick={handleNoAccessClick}
                    size='medium'
                >
                    New template
                </Button>
                <Dialogue
                    open={noAccessDialogOpen}
                    secondaryButtonText='Close'
                    onClose={() => setNoAccessDialogOpen(false)}
                    title='Contact admin to create release templates'
                >
                    You don&apos;t have the required permissions to create
                    release templates. You must contact your organization admin
                    to get access.{' '}
                </Dialogue>
            </>
        );
    }

    if (canCreateGlobalTemplate && canCreateProjectTemplate) {
        return (
            <>
                <Button
                    startIcon={<AddIcon />}
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                    aria-haspopup='menu'
                    size='medium'
                >
                    New template
                </Button>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuItem
                        component={RouterLink}
                        nativeButton={false}
                        to={formatReleaseTemplateCreatePath()}
                        onClick={() => handleNavigateToCreate()}
                    >
                        Global template
                    </MenuItem>
                    <MenuItem
                        component={RouterLink}
                        nativeButton={false}
                        to={formatReleaseTemplateCreatePath(projectId)}
                        onClick={() => handleNavigateToCreate(projectId)}
                    >
                        Project template
                    </MenuItem>
                </Menu>
            </>
        );
    }

    const project = canCreateProjectTemplate ? projectId : undefined;
    return (
        <Button
            component={RouterLink}
            nativeButton={false}
            to={formatReleaseTemplateCreatePath(project)}
            startIcon={<AddIcon />}
            onClick={() => handleNavigateToCreate(project)}
            size='medium'
        >
            New template
        </Button>
    );
};
