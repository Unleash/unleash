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
import { checkForEmptyValues } from './helpers';

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

    console.log(feature);

    const description =
        feature.isEnabled === 'unevaluated'
            ? `This feature toggle is Unevaluated in ${input?.environment} because `
            : feature.isEnabled
            ? `This feature toggle is True in ${input?.environment} because `
            : `This feature toggle is False in ${input?.environment} because `;

    const reason =
        feature.isEnabled === 'unevaluated'
            ? 'custom strategies are not evaluated yet'
            : feature.isEnabled
            ? 'at least one strategy is True'
            : feature?.isEnabledInCurrentEnvironment
            ? 'the environment is disabled'
            : 'all strategies are False';

    const color =
        feature.isEnabled === 'unevaluated'
            ? theme.palette.warning.main
            : feature.isEnabled
            ? theme.palette.success.main
            : theme.palette.error.main;

    const noValueTxt = checkForEmptyValues(input?.context)
        ? 'You did not provide a value for your context field in step 2 of the configuration'
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
                            enabled={
                                feature.isEnabled === 'unevaluated'
                                    ? 'unknown'
                                    : feature.isEnabled
                            }
                            label={String(feature.isEnabled)}
                            size={
                                feature.isEnabled === 'unevaluated'
                                    ? 'large'
                                    : 'default'
                            }
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
        </>
    );
};
