import { Delete, Edit } from '@material-ui/icons';
import classnames from 'classnames';
import { IN, NOT_IN } from 'constants/operators';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useParams } from 'react-router';
import { IFeatureViewParams } from '../../../interfaces/params';
import { IConstraint } from '../../../interfaces/strategy';
import FeatureStrategiesSeparator from '../../feature/FeatureView/FeatureStrategies2/FeatureStrategiesEnvironments/FeatureStrategiesSeparator/FeatureStrategiesSeparator';
import { UPDATE_FEATURE } from '../../providers/AccessProvider/permissions';
import ConditionallyRender from '../ConditionallyRender';
import PermissionIconButton from '../PermissionIconButton/PermissionIconButton';
import StringTruncator from '../StringTruncator/StringTruncator';
import { useStyles } from './Constraint.styles';

interface IConstraintProps {
    constraint: IConstraint;
    className?: string;
    deleteCallback?: () => void;
    editCallback?: () => void;
}

const Constraint = ({
    constraint,
    deleteCallback,
    editCallback,
    className,
    ...rest
}: IConstraintProps) => {
    // CHANGEME - Feat: Constraint Operators
    const { uiConfig } = useUiConfig();
    const styles = useStyles();
    const { projectId } = useParams<IFeatureViewParams>();

    const classes = classnames(styles.constraint, {
        [styles.column]:
            Array.isArray(constraint.values) && constraint.values.length > 2,
    });

    const editable = !!(deleteCallback && editCallback);
    // CHANGEME - Feat: Constraint Operators
    // Disable the edit button for constraints that are using new operators if
    // the new operators are not enabled
    const operatorIsNew =
        constraint.operator !== IN && constraint.operator !== NOT_IN;
    const disabledEdit = !uiConfig.flags.CO && operatorIsNew;

    return (
        <div className={classes + ' ' + className} {...rest}>
            <div className={classes + ' ' + className} {...rest}>
                <StringTruncator text={constraint.contextName} maxWidth="125" />
                <FeatureStrategiesSeparator
                    text={constraint.operator}
                    maxWidth="none"
                />
                <span className={styles.values}>
                    {constraint.values?.join(', ')}
                </span>
            </div>

            <ConditionallyRender
                condition={editable}
                show={
                    <div className={styles.btnContainer}>
                        <PermissionIconButton
                            onClick={editCallback}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                            disabled={disabledEdit}
                        >
                            <Edit titleAccess="Edit constraint" />
                        </PermissionIconButton>

                        <PermissionIconButton
                            onClick={deleteCallback}
                            permission={UPDATE_FEATURE}
                            projectId={projectId}
                        >
                            <Delete titleAccess="Delete constraint" />
                        </PermissionIconButton>
                    </div>
                }
            />
        </div>
    );
};

export default Constraint;
