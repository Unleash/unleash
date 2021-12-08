import React from 'react';
import { useHistory } from 'react-router-dom';
import Dialogue from '../Dialogue';
import { useStyles } from './EnvironmentStrategyDialog.styles';

interface IEnvironmentStrategyDialogProps {
    open: boolean;
    featureId: string;
    projectId: string;
    onClose: () => void;
    environmentName?: string;
}
const EnvironmentStrategyDialog = ({
    open,
    environmentName,
    featureId,
    projectId,
    onClose,
}: IEnvironmentStrategyDialogProps) => {
    const styles = useStyles();
    const history = useHistory();
    const strategiesLink = `/projects/${projectId}/features2/${featureId}/strategies?environment=${environmentName}&addStrategy=true`;

    return (
        <Dialogue
            open={open}
            maxWidth="sm"
            onClick={() => history.push(strategiesLink)}
            onClose={() => onClose()}
            title="You need to add a strategy to your toggle"
            primaryButtonText="Take me directly to add strategy"
            secondaryButtonText="Cancel"
        >
            <p className={styles.infoText}>
                Before you can enable the toggle in the environment, you need to
                add an activation strategy.
            </p>
            <p className={styles.infoText}>
                You can add the activation strategy by selecting the toggle, open
                the environment accordion and add the activation strategy.
            </p>
        </Dialogue>
    );
};

export default EnvironmentStrategyDialog;
