import { PlaygroundFeatureSchema } from '../../../../../../hooks/api/actions/usePlayground/playground.model';
import { Typography } from '@mui/material';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { useStyles } from './PlaygroundResultFeatureDetails.styles';
interface PlaygroundFeatureResultDetailsProps {
    feature: PlaygroundFeatureSchema;
}
export const PlaygroundResultFeatureDetails = ({
    feature,
}: PlaygroundFeatureResultDetailsProps) => {
    const { classes: styles } = useStyles();

    const description = feature.isEnabled
        ? 'This feature toggle is True in production because '
        : 'This feature toggle is False in production because ';
    const reason = feature.isEnabled
        ? 'at least one strategy is True'
        : 'all strategies are False';
    const color = feature.isEnabled ? 'success' : 'error';

    return (
        <>
            <div className={styles.titleRow}>
                <Typography variant={'subtitle1'} className={styles.name}>
                    {feature.name}
                </Typography>
                <span>
                    <PlaygroundResultChip enabled={feature.isEnabled} />
                </span>
            </div>
            <div className={styles.descriptionRow}>
                <Typography variant={'body1'}>{description}</Typography>
                <Typography variant={'body1'} color={color}>
                    {reason}
                </Typography>
            </div>
        </>
    );
};
