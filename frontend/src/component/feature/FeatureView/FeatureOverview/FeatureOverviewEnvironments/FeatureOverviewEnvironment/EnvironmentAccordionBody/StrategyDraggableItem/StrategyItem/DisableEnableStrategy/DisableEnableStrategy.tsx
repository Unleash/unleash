import { VFC, useState } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { DELETE_FEATURE_STRATEGY } from '@server/types/permissions';
import { STRATEGY_FORM_REMOVE_ID } from 'utils/testIds';

interface IDisableEnableStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
}

const DisableStrategy: VFC<IDisableEnableStrategyProps> = ({
    projectId,
    environmentId,
}) => {
    const [openDialogue, setOpenDialogue] = useState(false);

    return (
        <PermissionIconButton
            onClick={() => setOpenDialogue(true)}
            projectId={projectId}
            environmentId={environmentId}
            // disabled={disabled}
            permission={DELETE_FEATURE_STRATEGY}
            data-testid={STRATEGY_FORM_REMOVE_ID}
            tooltipProps={{ title: 'Disable strategy' }}
            type="button"
        >
            <BlockIcon />
        </PermissionIconButton>
    );
};

const EnableStrategy: VFC = () => {
    return <TrackChangesIcon />;
};

export const DisableEnableStrategy: VFC<IDisableEnableStrategyProps> = ({
    ...props
}) => {
    return <DisableStrategy {...props} />;
};
