import { VFC } from 'react';
import { Tooltip } from '@mui/material';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { useStyles } from './FeatureTypeCell.styles';

interface IFeatureTypeProps {
    value?: string;
}

export const FeatureTypeCell: VFC<IFeatureTypeProps> = ({ value }) => {
    const { classes: styles } = useStyles();
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(value);

    const typeName = featureTypes
        .filter(type => type.id === value)
        .map(type => type.name);

    const title = `This is a "${typeName || value}" toggle`;

    return (
        <Tooltip arrow placement="right" title={title}>
            <IconComponent data-loading className={styles.icon} />
        </Tooltip>
    );
};
