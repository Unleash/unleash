import { useStyles } from './FeatureType.styles';
import { Tooltip } from '@material-ui/core';
import { getFeatureTypeIcons } from '../../../../utils/get-feature-type-icons';


interface FeatureTypeProps {
    type: string;
}

const FeatureStatus = ({ type }: FeatureTypeProps) => {
    const styles = useStyles();
    const IconComponent = getFeatureTypeIcons(type);

    return (
        <Tooltip arrow placement="right" title={type}>
            <IconComponent
                data-loading
                className={styles.icon}
            />
        </Tooltip>
    );
};

export default FeatureStatus;
