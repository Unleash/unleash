import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { Alert, IconButton, Typography, useTheme, styled } from '@mui/material';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { CloseOutlined } from '@mui/icons-material';
import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    checkForEmptyValues,
    hasCustomStrategies,
    hasOnlyCustomStrategies,
} from './helpers';

const StyledDivWrapper = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
});

const StyledDivTitleRow = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
}));

const StyledDivAlertRow = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 0),
}));

const StyledDivDescriptionRow = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 0.5),
}));

const StyledTypographyName = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    padding: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton)({
    textAlign: 'right',
});

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
            <StyledDivWrapper>
                <StyledDivTitleRow>
                    <StyledTypographyName variant={'subtitle1'}>
                        {feature.name}
                    </StyledTypographyName>
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
                </StyledDivTitleRow>
                <StyledIconButton onClick={onCloseClick}>
                    <CloseOutlined />
                </StyledIconButton>
            </StyledDivWrapper>
            <StyledDivDescriptionRow>
                <Typography variant="body1" component="span">
                    {description}
                </Typography>
                <Typography variant="subtitle1" color={color} component="span">
                    {reason}
                </Typography>
                <Typography variant="body1" component="span">
                    .
                </Typography>
            </StyledDivDescriptionRow>
            <ConditionallyRender
                condition={Boolean(noValueTxt)}
                show={
                    <StyledDivAlertRow>
                        <Alert color={'info'}>{noValueTxt}</Alert>
                    </StyledDivAlertRow>
                }
            />
            <ConditionallyRender
                condition={Boolean(customStrategiesTxt)}
                show={
                    <StyledDivAlertRow>
                        <Alert severity="warning" color="info">
                            {customStrategiesTxt}
                        </Alert>
                    </StyledDivAlertRow>
                }
            />
        </>
    );
};
