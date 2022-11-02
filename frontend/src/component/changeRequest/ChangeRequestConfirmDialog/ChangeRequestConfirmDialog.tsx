import { FC } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IFeatureStrategy } from '../../../interfaces/strategy';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { formatStrategyName } from '../../../utils/strategyNames';

interface IChangeRequestDialogueProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    featureName?: string;
    environment?: string;
    fromEnvironment?: string;
    payload?: IFeatureStrategy | IFeatureStrategy[];
    showBanner?: boolean;
    enabled?: boolean;
    variant:
        | 'updateEnabled'
        | 'addStrategy'
        | 'copyStrategy'
        | 'copyStrategies'
        | 'removeStrategy'
        | 'updateStrategy';
}

interface UpdateEnabledMsg {
    enabled: boolean;
    featureName: string;
    environment: string;
}

const UpdateEnabled = ({
    enabled,
    featureName,
    environment,
}: UpdateEnabledMsg) => (
    <Typography>
        <strong>{enabled ? 'Disable' : 'Enable'}</strong> feature toggle{' '}
        <strong>{featureName}</strong> in <strong>{environment}</strong>
    </Typography>
);

interface CopyStrategyMsg {
    payload: IFeatureStrategy | IFeatureStrategy[];
    fromEnvironment: string;
    environment: string;
}

const CopyStrategy = ({
    payload,
    fromEnvironment,
    environment,
}: CopyStrategyMsg) => (
    <Typography>
        <strong>
            Copy {formatStrategyName((payload as IFeatureStrategy)?.name)}{' '}
            strategy{' '}
        </strong>{' '}
        from {fromEnvironment} to {environment}
    </Typography>
);

const MsgContainer = styled('div')(({ theme }) => ({
    '&>*:nth-child(n)': {
        margin: theme.spacing(1, 0),
    },
}));

const CopyStrategies = ({
    payload,
    fromEnvironment,
    environment,
}: CopyStrategyMsg) => (
    <MsgContainer>
        <Typography>
            <strong>Copy: </strong>
        </Typography>
        {(payload as IFeatureStrategy[])?.map(strategy => (
            <Typography>
                <strong>
                    {formatStrategyName((strategy as IFeatureStrategy)?.name)}{' '}
                    strategy{' '}
                </strong>{' '}
            </Typography>
        ))}
        <Typography>
            from {fromEnvironment} to {environment}
        </Typography>
    </MsgContainer>
);

export const ChangeRequestDialogue: FC<IChangeRequestDialogueProps> = ({
    isOpen,
    onConfirm,
    onClose,
    payload,
    enabled,
    featureName,
    environment,
    fromEnvironment,
    variant,
    showBanner,
}) => (
    <Dialogue
        open={isOpen}
        primaryButtonText="Add suggestion to draft"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={onClose}
        title="Request changes"
        fullWidth
    >
        {showBanner && (
            <Alert severity="info" sx={{ mb: 2 }}>
                Suggest changes is enabled for {environment}. Your changes needs
                to be approved before they will be live. All the changes you do
                now will be added into a draft that you can submit for review.
            </Alert>
        )}
        <Typography variant="body2" color="text.secondary">
            Your suggestion:
        </Typography>
        <ConditionallyRender
            condition={variant === 'updateEnabled'}
            show={
                <UpdateEnabled
                    environment={environment!}
                    featureName={featureName!}
                    enabled={enabled!}
                />
            }
        />
        <ConditionallyRender
            condition={variant === 'copyStrategy'}
            show={
                <CopyStrategy
                    environment={environment!}
                    fromEnvironment={fromEnvironment!}
                    payload={payload!}
                />
            }
        />
        <ConditionallyRender
            condition={variant === 'copyStrategies'}
            show={
                <CopyStrategies
                    environment={environment!}
                    fromEnvironment={fromEnvironment!}
                    payload={payload!}
                />
            }
        />
    </Dialogue>
);
