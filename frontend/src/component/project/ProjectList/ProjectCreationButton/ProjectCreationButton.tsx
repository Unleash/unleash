import { useContext, type FC, type ReactNode } from 'react';
import type { ITooltipResolverProps } from 'component/common/TooltipResolver/TooltipResolver';
import AccessContext from 'contexts/AccessContext';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import Add from '@mui/icons-material/Add';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import ProPlanIcon from 'assets/icons/pro-enterprise-feature-badge.svg?react';
import ProPlanIconLight from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import { CreateProjectDialog } from '../../Project/CreateProject/NewCreateProjectForm/CreateProjectDialog.tsx';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface ICreateButtonData {
    disabled: boolean;
    tooltip?: Omit<ITooltipResolverProps, 'children'>;
    endIcon?: ReactNode;
}

const NAVIGATE_TO_CREATE_PROJECT = 'NAVIGATE_TO_CREATE_PROJECT';

function resolveCreateButtonData(
    isOss: boolean,
    hasAccess: boolean,
    mode: 'plans' | 'upgrade' = 'plans',
): ICreateButtonData {
    if (isOss) {
        return {
            disabled: true,
            tooltip: {
                titleComponent: (
                    <PremiumFeature
                        feature='adding-new-projects'
                        mode={mode}
                        tooltip
                    />
                ),
                sx: { maxWidth: '320px' },
                variant: 'custom',
            },
            endIcon: (
                <ThemeMode
                    darkmode={<ProPlanIconLight />}
                    lightmode={<ProPlanIcon />}
                />
            ),
        };
    } else if (!hasAccess) {
        return {
            tooltip: {
                title: 'You do not have permission to create new projects',
            },
            disabled: true,
        };
    } else {
        return {
            tooltip: { title: 'Click to create a new project' },
            disabled: false,
        };
    }
}

type ProjectCreationButtonProps = {
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
};

export const ProjectCreationButton: FC<ProjectCreationButtonProps> = ({
    isDialogOpen,
    setIsDialogOpen,
}) => {
    const { hasAccess } = useContext(AccessContext);
    const { isOss, loading } = useUiConfig();

    const createButtonData = resolveCreateButtonData(
        isOss(),
        hasAccess(CREATE_PROJECT),
        'upgrade',
    );

    return (
        <>
            <ResponsiveButton
                Icon={Add}
                endIcon={createButtonData.endIcon}
                onClick={() => setIsDialogOpen(true)}
                maxWidth='700px'
                permission={CREATE_PROJECT}
                disabled={createButtonData.disabled || loading}
                tooltipProps={createButtonData.tooltip}
                data-testid={NAVIGATE_TO_CREATE_PROJECT}
            >
                New project
            </ResponsiveButton>
            <CreateProjectDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};
