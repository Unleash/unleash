import { Box, Radio, RadioGroup, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { LegalValueLabel } from 'component/common/NewConstraintAccordion/LegalValueLabel/LegalValueLabel.tsx';
import { useState } from 'react';
import useFeatureLifecycleApi from 'hooks/api/actions/useFeatureLifecycleApi/useFeatureLifecycleApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SingleVariantOptions } from './SingleVariantOptions.tsx';
import { useParentVariantOptions } from 'hooks/api/getters/useFeatureDependencyOptions/useFeatureDependencyOptions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IMarkCompletedDialogueProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onComplete: () => void;
    projectId: string;
    featureId: string;
}

type Status = 'kept' | 'discarded' | 'kept-with-variant';

export const MarkCompletedDialogue = ({
    projectId,
    featureId,
    isOpen,
    setIsOpen,
    onComplete,
}: IMarkCompletedDialogueProps) => {
    const { markFeatureCompleted } = useFeatureLifecycleApi();
    const { parentVariantOptions: variantOptions } = useParentVariantOptions(
        projectId,
        featureId,
    );
    const [status, setStatus] = useState<Status>('kept');
    const [variant, setVariant] = useState<string | undefined>(undefined);

    const { trackEvent } = usePlausibleTracker();

    const onClick = async () => {
        const sentStatus = status === 'kept-with-variant' ? 'kept' : status;
        await markFeatureCompleted(featureId, projectId, {
            status: sentStatus,
            statusValue: variant,
        });
        setIsOpen(false);
        onComplete();
        trackEvent('feature-lifecycle', {
            props: {
                eventType: 'complete',
                status: sentStatus,
            },
        });
    };

    return (
        <Dialogue
            open={isOpen}
            title='Mark completed'
            onClose={() => {
                setIsOpen(false);
            }}
            disabledPrimaryButton={
                status === 'kept-with-variant' && variant === null
            }
            onClick={onClick}
            primaryButtonText={'Mark completed'}
            secondaryButtonText='Cancel'
        >
            <Box>
                <Box
                    sx={{
                        mt: 2,
                        mb: 4,
                    }}
                >
                    Marking the feature <b>{featureId}</b> as complete does not
                    affect any configuration, but it moves the feature flag into
                    it’s next life cycle stage and is an indication that you
                    have learned what you needed in order to progress with the
                    feature. It serves as a reminder to start cleaning up the
                    feature flag and removing it from the code.
                </Box>

                <Typography
                    sx={{
                        mb: 2,
                    }}
                >
                    <b>What was the outcome of this feature?</b>
                </Typography>
                <RadioGroup
                    aria-label='selected-value'
                    name='selected'
                    sx={{ gap: (theme) => theme.spacing(0.5) }}
                    onChange={(_e, value) => {
                        setStatus(value as Status);
                    }}
                >
                    <LegalValueLabel
                        key={'kept'}
                        value={'kept'}
                        legal={{
                            value: 'We decided to keep the feature',
                        }}
                        control={<Radio />}
                    />
                    <LegalValueLabel
                        key={'discarded'}
                        value={'discarded'}
                        legal={{
                            value: 'We decided to discard the feature',
                        }}
                        control={<Radio />}
                    />
                    <ConditionallyRender
                        condition={variantOptions.length > 0}
                        show={
                            <LegalValueLabel
                                key={'kept-with-variant'}
                                value={'kept-with-variant'}
                                legal={{
                                    value: 'We decided to keep the feature variant',
                                    description:
                                        'Choose to specify which feature variant will be kept',
                                }}
                                control={<Radio />}
                            />
                        }
                    />
                    <ConditionallyRender
                        condition={
                            variantOptions.length > 0 &&
                            status === 'kept-with-variant'
                        }
                        show={
                            <SingleVariantOptions
                                parent={featureId}
                                project={projectId}
                                onSelect={(variant) => {
                                    setVariant(variant);
                                }}
                            />
                        }
                    />
                </RadioGroup>
            </Box>
        </Dialogue>
    );
};
