import { Typography, Box, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { type IRolloutSliderProps, RolloutSlider } from './RolloutSlider.tsx';

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledSubheader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const SliderWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const LegacyRolloutSlider = ({
    name,
    value,
    onChange,
    disabled,
    step,
}: IRolloutSliderProps) => (
    <SliderWrapper>
        <StyledBox>
            <Typography>{name}</Typography>
            <HelpIcon
                htmlTooltip
                tooltip={
                    <Box>
                        <StyledHeader variant='h3'>
                            Rollout percentage
                        </StyledHeader>
                        <Typography variant='body2'>
                            The rollout percentage determines the proportion of
                            users exposed to a feature. It's based on the
                            MurmurHash of a user's unique identifier, normalized
                            to a number between 1 and 100. If the normalized
                            hash is less than or equal to the rollout
                            percentage, the user sees the feature. This ensures
                            a consistent, random distribution of the feature
                            among users.
                        </Typography>

                        <StyledSubheader variant='h3'>
                            Stickiness
                        </StyledSubheader>
                        <Typography variant='body2'>
                            Stickiness refers to the value used for hashing to
                            ensure a consistent user experience. It determines
                            the input for the MurmurHash, ensuring that a user's
                            feature exposure remains consistent across sessions.
                            <br />
                            By default Unleash will use the first value present
                            in the context in the order of{' '}
                            <b>userId, sessionId and random</b>.
                        </Typography>

                        <StyledSubheader variant='h3'>GroupId</StyledSubheader>
                        <Typography variant='body2'>
                            The groupId is used as a seed for the hash function,
                            ensuring consistent feature exposure across
                            different feature flags for a uniform user
                            experience.
                        </Typography>
                    </Box>
                }
            />
        </StyledBox>
        <RolloutSlider
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            step={step}
        />
    </SliderWrapper>
);

export default LegacyRolloutSlider;
