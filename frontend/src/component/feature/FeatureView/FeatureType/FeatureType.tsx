import { useStyles } from './FeatureType.styles';
import { Tooltip } from '@mui/material';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';

interface IFeatureTypeProps {
    type: string;
}

const FeatureStatus = ({ type }: IFeatureTypeProps) => {
    const { classes: styles } = useStyles();
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);

    const typeName = featureTypes.filter(t => t.id === type).map(t => t.name);
    const title = `"${typeName || type}" toggle`;

    return (
        <Tooltip arrow title={title}>
            <IconComponent data-loading className={styles.icon} />
        </Tooltip>
    );
};

export default FeatureStatus;
