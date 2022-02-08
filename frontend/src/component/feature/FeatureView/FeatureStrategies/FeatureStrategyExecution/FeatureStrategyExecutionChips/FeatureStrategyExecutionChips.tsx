import { Chip } from '@material-ui/core';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyExecutionChips.styles';

interface IFeatureStrategyExecutionChipsProps {
    value: string[];
    text: string;
}

const FeatureStrategyExecutionChips = ({
    value,
    text,
}: IFeatureStrategyExecutionChipsProps) => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <ConditionallyRender
                condition={value.length === 0}
                show={<p>No {text}s added yet.</p>}
                elseShow={
                    <div>
                        <p className={styles.paragraph}>
                            {value.length}{' '}
                            {value.length > 1 ? `${text}s` : text} will get
                            access.
                        </p>
                        {value.map((userId: string) => (
                            <Chip
                                key={userId}
                                label={userId}
                                className={styles.chip}
                            />
                        ))}
                    </div>
                }
            />
        </div>
    );
};

export default FeatureStrategyExecutionChips;
