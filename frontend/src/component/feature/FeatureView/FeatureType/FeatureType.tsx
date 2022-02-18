import { useStyles } from './FeatureType.styles';
import { Tooltip } from '@material-ui/core';
import { getFeatureTypeIcons } from '../../../../utils/get-feature-type-icons';
import useFeatureTypes from '../../../../hooks/api/getters/useFeatureTypes/useFeatureTypes';

interface FeatureTypeProps {
    type: string;
}

const FeatureStatus = ({ type }: FeatureTypeProps) => {
    const styles = useStyles();
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);

    const typeName = featureTypes.filter(t => t.id === type).map(t => t.name);

    const title = `This is a "${typeName || type}" toggle`;

    return (
        <Tooltip arrow placement="right" title={title}>
            <IconComponent data-loading className={styles.icon} />
        </Tooltip>
    );
};

export default FeatureStatus;
