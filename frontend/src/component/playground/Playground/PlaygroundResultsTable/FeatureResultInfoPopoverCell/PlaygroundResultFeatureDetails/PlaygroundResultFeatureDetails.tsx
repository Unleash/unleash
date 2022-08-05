import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from '../../../../../../hooks/api/actions/usePlayground/playground.model';
import { Alert, IconButton, Typography, useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { useStyles } from './PlaygroundResultFeatureDetails.styles';
import { CloseOutlined } from '@mui/icons-material';
import React from 'react';
import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import {
    checkForEmptyValues,
    hasCustomStrategies,
    hasOnlyCustomStrategies,
} from './helpers';

interface PlaygroundFeatureResultDetailsProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
    onClose: () => void;
}
export const PlaygroundResultFeatureDetails = ({
    feature,
    input,
    onClose,
}: PlaygroundFeatureResultDetailsProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const description = feature.isEnabled
        ? `This feature toggle is True in ${input?.environment} because `
        : `This feature toggle is False in ${input?.environment} because `;

    const reason = feature.isEnabled
        ? 'at least one strategy is True'
        : !feature.isEnabledInCurrentEnvironment
        ? 'the environment is disabled'
        : hasOnlyCustomStrategies(feature)
        ? 'no strategies could be fully evaluated'
        : 'all strategies are either False or could not be fully evaluated';

    const color = feature.isEnabled
        ? theme.palette.success.main
        : theme.palette.error.main;

    const noValueTxt = checkForEmptyValues(input?.context)
        ? 'You did not provide a value for your context field in step 2 of the configuration'
        : undefined;

    const customStrategiesTxt = hasCustomStrategies(feature)
        ? `You have custom strategies. Custom strategies can't be evaluated and they will be set as Unevaluated`
        : undefined;

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
                        <PlaygroundResultChip
                            enabled={feature.isEnabled}
                            label={feature.isEnabled ? 'True' : 'False'}
                        />
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
            <ConditionallyRender
                condition={Boolean(noValueTxt)}
                show={
                    <div className={styles.alertRow}>
                        <Alert color={'info'}>{noValueTxt}</Alert>
                    </div>
                }
            />
            <ConditionallyRender
                condition={Boolean(customStrategiesTxt)}
                show={
                    <div className={styles.alertRow}>
                        <Alert color={'info'}>{customStrategiesTxt}</Alert>
                    </div>
                }
            />
        </>
    );
};
