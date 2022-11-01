import { FC } from 'react';
import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {ISuggestChangeSchema} from "../../../hooks/api/actions/useSuggestChangeApi/useSuggestChangeApi";
import {IFeatureStrategyPayload} from "../../../interfaces/strategy";
import {PartialSome} from "../../../../../src/lib/types/partial";

interface ISuggestChangesDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    featureName?: string;
    environment?: string;
    fromEnvironment?: string;
    payload?: IFeatureStrategyPayload | IFeatureStrategyPayload[];
    showBanner?: boolean;
    enabled?: boolean;
    variant: 'updateEnabled' | 'addStrategy' | 'copyStrategy' | 'removeStrategy' | 'updateStrategy'
}

interface UpdateEnabledMsg {
    enabled: boolean;
    featureName: string;
    environment: string;
}

const UpdateEnabled = ({enabled, featureName, environment}: UpdateEnabledMsg) => (
    <Typography>
        <strong>{enabled ? 'Disable' : 'Enable'}</strong> feature toggle{' '}
        <strong>{featureName}</strong> in <strong>{environment}</strong>
    </Typography>
)

interface CopyStrategyMsg {
    payload: IFeatureStrategyPayload | IFeatureStrategyPayload[];
    fromEnvironment: string;
    environment: string;
}

const CopyStrategy = ({payload, fromEnvironment, environment}: CopyStrategyMsg) => (
    <>
    {Array.isArray(payload) ?
        payload.map(strategy => (
            <Typography>
                <strong>Copy {strategy!.name} strategy </strong>{' '}
                from {fromEnvironment} to {environment}
            </Typography>
        ))
        :
        (<Typography>
            <strong>Copy {payload!.name} strategy </strong>{' '}
            from {fromEnvironment} to {environment}
        </Typography>)}
    </>
);

export const SuggestChangesDialogue: FC<ISuggestChangesDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    payload,
    enabled,
    featureName,
    environment,
    fromEnvironment,
    variant,
    showBanner

}) => (
    <Dialogue
        open={isOpen}
        primaryButtonText="Add to draft"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={onClose}
        title="Suggest changes"
    >
        {showBanner && <Alert severity="info" sx={{mb: 2}}>
            Suggest changes is enabled for {environment}. Your changes needs to
            be approved before they will be live. All the changes you do now
            will be added into a draft that you can submit for review.
        </Alert>}
        <Typography variant="body2" color="text.secondary">
           Your suggestion:
        </Typography>
        {variant === 'updateEnabled' && (
            <UpdateEnabled
                environment={environment!}
                featureName={featureName!}
                enabled={enabled!}
            />)
        }

        {variant === 'copyStrategy' && (
            <CopyStrategy
                environment={environment!}
                fromEnvironment={fromEnvironment!}
                payload={payload!}
            />)
        }
    </Dialogue>
);
