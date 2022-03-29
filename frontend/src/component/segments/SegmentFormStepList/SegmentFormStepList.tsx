import { FiberManualRecord } from '@material-ui/icons';
import { useStyles } from './SegmentFormStepList.styles';
import React from 'react';
import classNames from 'classnames';

interface ISegmentFormStepListProps {
    total: number;
    current: number;
}

export const SegmentFormStepList: React.FC<ISegmentFormStepListProps> = ({
    total,
    current,
}) => {
    const styles = useStyles();

    // Create a list with all the step numbers, e.g. [1, 2, 3].
    const steps: number[] = Array.from({ length: total }).map((_, i) => {
        return i + 1;
    });

    return (
        <div className={styles.container}>
            <div className={styles.steps}>
                <span className={styles.stepsText}>
                    Step {current} of {total}
                </span>
                {steps.map(step => (
                    <FiberManualRecord
                        key={step}
                        className={classNames(
                            styles.circle,
                            step === current && styles.filledCircle
                        )}
                    />
                ))}
            </div>
        </div>
    );
};
