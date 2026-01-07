import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { Alert, Typography, useTheme, styled, IconButton } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import type React from 'react';
import {
    checkForEmptyValues,
    hasCustomStrategies,
    hasOnlyCustomStrategies,
} from './helpers.ts';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip.tsx';

const HeaderRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
});

const HeaderGroup = styled('hgroup')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledTypographyName = styled('h3')(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.subtitle1.fontSize,
    margin: 0,
}));

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
    const theme = useTheme();

    const [description, reason, color] = (() => {
        if (feature.isEnabled)
            return [
                `This feature flag is True in ${input?.environment} because `,
                'at least one strategy is True',
                theme.palette.success.contrastText,
            ];

        if (
            feature.hasUnsatisfiedDependency &&
            !feature.isEnabledInCurrentEnvironment
        ) {
            return [
                `This feature flag is False in ${input?.environment} because `,
                'parent dependency is not satisfied and the environment is disabled',
                theme.palette.error.contrastText,
            ];
        }

        if (!feature.isEnabledInCurrentEnvironment)
            return [
                `This feature flag is False in ${input?.environment} because `,
                'the environment is disabled',
                theme.palette.error.contrastText,
            ];

        if (hasOnlyCustomStrategies(feature))
            return [
                `This feature flag is Unknown in ${input?.environment} because `,
                'no strategies could be fully evaluated',
                theme.palette.warning.contrastText,
            ];

        if (hasCustomStrategies(feature))
            return [
                `This feature flag is Unknown in ${input?.environment} because `,
                'not all strategies could be fully evaluated',
                theme.palette.warning.contrastText,
            ];

        if (feature.hasUnsatisfiedDependency) {
            return [
                `This feature flag is False in ${input?.environment} because `,
                'parent dependency is not satisfied',
                theme.palette.error.contrastText,
            ];
        }

        return [
            `This feature flag is False in ${input?.environment} because `,
            'all strategies are either False or could not be fully evaluated',
            theme.palette.error.contrastText,
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
            <HeaderRow>
                <HeaderGroup>
                    <StyledTypographyName>{feature.name}</StyledTypographyName>
                    <p>
                        {feature?.strategies?.result !== 'unknown' ? (
                            <PlaygroundResultChip
                                enabled={feature.isEnabled}
                                label={feature.isEnabled ? 'True' : 'False'}
                            />
                        ) : (
                            <PlaygroundResultChip
                                enabled='unknown'
                                label={'Unknown'}
                                showIcon={false}
                            />
                        )}
                    </p>
                </HeaderGroup>
                <IconButton aria-label='Close' onClick={onCloseClick}>
                    <CloseOutlined />
                </IconButton>
            </HeaderRow>
            <p>
                {description}
                <Typography color={color} component='span'>
                    {reason}
                </Typography>
                .
            </p>
            {noValueTxt ? <Alert color={'info'}>{noValueTxt}</Alert> : null}
            {customStrategiesTxt ? (
                <Alert severity='warning' color='info'>
                    {customStrategiesTxt}
                </Alert>
            ) : null}
        </>
    );
};
