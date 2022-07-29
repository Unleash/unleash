import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategyDraggableItem } from './StrategyDraggableItem/StrategyDraggableItem';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { FeatureStrategyEmpty } from 'component/feature/FeatureStrategy/FeatureStrategyEmpty/FeatureStrategyEmpty';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStyles } from './EnvironmentAccordionBody.styles';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

interface IEnvironmentAccordionBodyProps {
    isDisabled: boolean;
    featureEnvironment?: IFeatureEnvironment;
    otherEnvironments?: IFeatureEnvironment['name'][];
}

const EnvironmentAccordionBody = ({
    featureEnvironment,
    isDisabled,
    otherEnvironments,
}: IEnvironmentAccordionBodyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { setStrategiesSortOrder } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);

    const [strategies, setStrategies] = useState(
        featureEnvironment?.strategies || []
    );
    const { classes: styles } = useStyles();
    useEffect(() => {
        // Use state to enable drag and drop, but switch to API output when it arrives
        setStrategies(featureEnvironment?.strategies || []);
    }, [featureEnvironment?.strategies]);

    if (!featureEnvironment) {
        return null;
    }

    const onDragAndDrop = async (
        from: number,
        to: number,
        dropped?: boolean
    ) => {
        if (from !== to && dropped) {
            const newStrategies = [...strategies];
            const movedStrategy = newStrategies.splice(from, 1)[0];
            newStrategies.splice(to, 0, movedStrategy);
            setStrategies(newStrategies);
            try {
                await setStrategiesSortOrder(
                    projectId,
                    featureId,
                    featureEnvironment.name,
                    [...newStrategies].map((strategy, sortOrder) => ({
                        id: strategy.id,
                        sortOrder,
                    }))
                );
                refetchFeature();
                setToastData({
                    title: 'Order of strategies updated',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    return (
        <div className={styles.accordionBody}>
            <div className={styles.accordionBodyInnerContainer}>
                <ConditionallyRender
                    condition={strategies.length > 0 && isDisabled}
                    show={() => (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            This environment is disabled, which means that none
                            of your strategies are executing.
                        </Alert>
                    )}
                />
                <ConditionallyRender
                    condition={strategies.length > 0}
                    show={
                        <>
                            {strategies.map((strategy, index) => (
                                <StrategyDraggableItem
                                    key={strategy.id}
                                    onDragAndDrop={onDragAndDrop}
                                    strategy={strategy}
                                    index={index}
                                    environmentName={featureEnvironment.name}
                                    otherEnvironments={otherEnvironments}
                                />
                            ))}
                        </>
                    }
                    elseShow={
                        <FeatureStrategyEmpty
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={featureEnvironment.name}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default EnvironmentAccordionBody;
