import { useMemo } from 'react';
import useProject from 'hooks/api/getters/useProject/useProject';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useStyles } from './FeatureSettingsProjectConfirm.styles';
import { arraysHaveSameItems } from 'utils/arraysHaveSameItems';
import { Alert } from '@mui/material';

interface IFeatureSettingsProjectConfirm {
    projectId: string;
    open: boolean;
    onClose: () => void;
    onClick: (args: any) => void;
    feature: IFeatureToggle;
}

const FeatureSettingsProjectConfirm = ({
    projectId,
    open,
    onClose,
    onClick,
    feature,
}: IFeatureSettingsProjectConfirm) => {
    const { project } = useProject(projectId);
    const { classes: styles } = useStyles();

    const hasSameEnvironments: boolean = useMemo(() => {
        return arraysHaveSameItems(
            feature.environments.map(env => env.name),
            project.environments
        );
    }, [feature, project]);

    return (
        <ConditionallyRender
            condition={hasSameEnvironments}
            show={
                <Dialogue
                    open={open}
                    onClose={onClose}
                    onClick={onClick}
                    title="Confirm change project"
                    primaryButtonText="Change project"
                    secondaryButtonText="Cancel"
                >
                    <div className={styles.container}>
                        <Alert severity="success">
                            This feature toggle is compatible with the new
                            project.
                        </Alert>
                        <p>
                            Are you sure you want to change the project for this
                            toggle?
                        </p>
                    </div>
                </Dialogue>
            }
            elseShow={
                <Dialogue
                    open={open}
                    onClose={onClose}
                    title="Confirm change project"
                    secondaryButtonText="OK"
                >
                    <div className={styles.container}>
                        <Alert severity="warning">
                            Incompatible project environments
                        </Alert>
                        <p>
                            In order to move a feature toggle between two
                            projects, both projects must have the exact same
                            environments enabled.
                        </p>
                    </div>
                </Dialogue>
            }
        />
    );
};

export default FeatureSettingsProjectConfirm;
