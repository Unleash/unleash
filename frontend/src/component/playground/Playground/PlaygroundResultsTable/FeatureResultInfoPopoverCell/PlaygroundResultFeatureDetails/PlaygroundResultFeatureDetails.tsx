import { PlaygroundFeatureSchema } from '../../../../../../hooks/api/actions/usePlayground/playground.model';
import { IconButton, Typography, useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { useStyles } from './PlaygroundResultFeatureDetails.styles';
import { CloseOutlined } from '@mui/icons-material';
import React from 'react';
interface PlaygroundFeatureResultDetailsProps {
    feature: PlaygroundFeatureSchema;
    onClose: () => void;
}
export const PlaygroundResultFeatureDetails = ({
    feature,
    onClose,
}: PlaygroundFeatureResultDetailsProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const description = feature.isEnabled
        ? 'This feature toggle is True in production because '
        : 'This feature toggle is False in production because ';
    const reason = feature.isEnabled
        ? 'at least one strategy is True'
        : 'all strategies are False';
    const color = feature.isEnabled
        ? theme.palette.success.main
        : theme.palette.error.main;

    const onCloseClick =
        onClose &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onClose();
        });

    return (
        <>
            <div className={styles.titleRowWrapper}>
                <div className={styles.titleRow}>
                    <Typography variant={'subtitle1'} className={styles.name}>
                        {feature.name}
                    </Typography>
                    <span>
                        <PlaygroundResultChip enabled={feature.isEnabled} />
                    </span>
                </div>
                <IconButton onClick={onCloseClick} className={styles.icon}>
                    <CloseOutlined />
                </IconButton>
            </div>
            <div className={styles.descriptionRow}>
                <Typography variant="body1" component="span">
                    {description}
                </Typography>
                <Typography variant="subtitle1" color={color} component="span">
                    {reason}
                </Typography>
            </div>
        </>
    );
};
