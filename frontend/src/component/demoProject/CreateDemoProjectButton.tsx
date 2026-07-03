import type { FC } from 'react';
import type { ButtonProps } from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useUiFlag } from 'hooks/useUiFlag';
import { useSeedDemoProject } from './useSeedDemoProject.ts';

type CreateDemoProjectButtonProps = {
    variant?: ButtonProps['variant'];
};

/**
 * Seeds a pre-populated example project ("Demo: Online Shop") so that new
 * users can explore a living project instead of an empty instance. Gated
 * behind the `demoProjectSeeding` UI flag.
 */
export const CreateDemoProjectButton: FC<CreateDemoProjectButtonProps> = ({
    variant = 'outlined',
}) => {
    const demoProjectSeedingEnabled = useUiFlag('demoProjectSeeding');
    const { seedDemoProject, seeding } = useSeedDemoProject();

    if (!demoProjectSeedingEnabled) {
        return null;
    }

    return (
        <ResponsiveButton
            Icon={AutoAwesome}
            onClick={seedDemoProject}
            maxWidth='700px'
            permission={CREATE_PROJECT}
            disabled={seeding}
            variant={variant}
            tooltipProps={{
                title: 'Create a pre-populated example project to explore flags, strategies, variants and segments',
            }}
            data-testid='CREATE_DEMO_PROJECT_BUTTON'
        >
            {seeding ? 'Creating example project...' : 'Create example project'}
        </ResponsiveButton>
    );
};
