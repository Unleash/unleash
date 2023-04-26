import { FC, ReactNode } from 'react';
import {
    IChange,
    IChangeRequest,
    IChangeRequestFeature,
} from '../../../changeRequest.types';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, styled } from '@mui/material';
import { ToggleStatusChange } from './ToggleStatusChange';
import { StrategyChange } from './StrategyChange';
import { VariantPatch } from './VariantPatch/VariantPatch';

const StyledSingleChangeBox = styled(Box, {
    shouldForwardProp: (prop: string) => !prop.startsWith('$'),
})<{
    $hasConflict: boolean;
    $isAfterWarning: boolean;
    $isLast: boolean;
    $isInConflictFeature: boolean;
}>(
    ({
        theme,
        $hasConflict,
        $isInConflictFeature,
        $isAfterWarning,
        $isLast,
    }) => ({
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderTop: '1px solid',
        borderBottom: $isLast ? '1px solid' : 'none',
        borderRadius: $isLast
            ? `0 0
                ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`
            : 0,
        borderColor:
            $hasConflict || $isInConflictFeature
                ? theme.palette.warning.border
                : theme.palette.divider,
        borderTopColor:
            ($hasConflict || $isAfterWarning) && !$isInConflictFeature
                ? theme.palette.warning.border
                : theme.palette.divider,
    })
);

const StyledAlert = styled(Alert)(({ theme }) => ({
    borderRadius: 0,
    padding: theme.spacing(0, 2),
    '&.MuiAlert-standardWarning': {
        borderStyle: 'none none solid none',
    },
}));

export const Change: FC<{
    discard: ReactNode;
    index: number;
    changeRequest: IChangeRequest;
    change: IChange;
    feature: IChangeRequestFeature;
}> = ({ index, change, feature, changeRequest, discard }) => {
    const lastIndex = feature.defaultChange
        ? feature.changes.length + 1
        : feature.changes.length;

    return (
        <StyledSingleChangeBox
            key={objectId(change)}
            $hasConflict={Boolean(change.conflict)}
            $isInConflictFeature={Boolean(feature.conflict)}
            $isAfterWarning={Boolean(feature.changes[index - 1]?.conflict)}
            $isLast={index + 1 === lastIndex}
        >
            <ConditionallyRender
                condition={Boolean(change.conflict) && !feature.conflict}
                show={
                    <StyledAlert severity="warning">
                        <strong>Conflict!</strong> This change can’t be applied.{' '}
                        {change.conflict}.
                    </StyledAlert>
                }
            />
            <Box sx={theme => ({ padding: theme.spacing(3) })}>
                {change.action === 'updateEnabled' && (
                    <ToggleStatusChange
                        enabled={change.payload.enabled}
                        discard={discard}
                    />
                )}
                {change.action === 'addStrategy' ||
                change.action === 'deleteStrategy' ||
                change.action === 'updateStrategy' ? (
                    <StrategyChange
                        discard={discard}
                        change={change}
                        featureName={feature.name}
                        environmentName={changeRequest.environment}
                        projectId={changeRequest.project}
                    />
                ) : null}
                {change.action === 'patchVariant' && (
                    <VariantPatch
                        feature={feature.name}
                        project={changeRequest.project}
                        environment={changeRequest.environment}
                        change={change}
                        discard={discard}
                    />
                )}
            </Box>
        </StyledSingleChangeBox>
    );
};
