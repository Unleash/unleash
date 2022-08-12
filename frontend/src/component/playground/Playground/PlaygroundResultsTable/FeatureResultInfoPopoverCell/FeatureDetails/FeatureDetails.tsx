import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { Alert, IconButton, Typography, useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { useStyles } from './FeatureDetails.styles';
import { CloseOutlined } from '@mui/icons-material';
import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
export const FeatureDetails = ({
    feature,
    input,
    onClose,
}: PlaygroundFeatureResultDetailsProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const [description, reason, color] = (() => {
        if (feature.isEnabled)
            return [
                `This feature toggle is True in ${input?.environment} because `,
                'at least one strategy is True',
                theme.palette.success.main,
            ];

        if (!feature.isEnabledInCurrentEnvironment)
            return [
                `This feature toggle is False in ${input?.environment} because `,
                'the environment is disabled',
                theme.palette.error.main,
            ];

        if (hasOnlyCustomStrategies(feature))
            return [
                `This feature toggle is Unknown in ${input?.environment} because `,
                'no strategies could be fully evaluated',
                theme.palette.warning.main,
            ];

        if (hasCustomStrategies(feature))
            return [
                `This feature toggle is Unknown in ${input?.environment} because `,
                'not all strategies could be fully evaluated',
                theme.palette.warning.main,
            ];

        return [
            `This feature toggle is False in ${input?.environment} because `,
            'all strategies are either False or could not be fully evaluated',
            theme.palette.error.main,
        ];
    })();

    const noValueTxt = checkForEmptyValues(input?.context)
        ? 'You did not provide a value for your context field in step 2 of the configuration'
        : undefined;

    const customStrategiesTxt = hasCustomStrategies(feature)
        ? `This feature uses custom strategies. Custom strategies can't be evaluated, so they will be marked accordingly.`
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
                    <ConditionallyRender
                        condition={feature?.strategies?.result !== 'unknown'}
                        show={() => (
                            <PlaygroundResultChip
                                enabled={feature.isEnabled}
                                label={feature.isEnabled ? 'True' : 'False'}
                            />
                        )}
                        elseShow={() => (
                            <PlaygroundResultChip
                                enabled="unknown"
                                label={'Unknown'}
                                showIcon={false}
                            />
                        )}
                    />
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
                <Typography variant="body1" component="span">
                    .
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
                        <Alert severity="warning" color="info">
                            {customStrategiesTxt}
                        </Alert>
                    </div>
                }
            />
        </>
    );
};
