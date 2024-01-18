import {
    Alert,
    FormControl,
    FormControlLabel,
    Link,
    Radio,
    RadioGroup,
    styled,
} from '@mui/material';
import Input from 'component/common/Input/Input';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import {
    IncomingWebhooksFormErrors,
    TokenGeneration,
} from './useIncomingWebhooksForm';
import { IncomingWebhooksFormURL } from './IncomingWebhooksFormURL';
import { IncomingWebhooksTokens } from './IncomingWebhooksTokens/IncomingWebhooksTokens';

const StyledRaisedSection = styled('div')(({ theme }) => ({
    background: theme.palette.background.elevation1,
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(4),
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledSecondarySection = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusMedium,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
}));

const StyledInlineContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
    '& > p:not(:first-of-type)': {
        marginTop: theme.spacing(2),
    },
}));

interface IIncomingWebhooksFormProps {
    incomingWebhook?: IIncomingWebhook;
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    tokenGeneration: TokenGeneration;
    setTokenGeneration: React.Dispatch<React.SetStateAction<TokenGeneration>>;
    tokenName: string;
    setTokenName: React.Dispatch<React.SetStateAction<string>>;
    errors: IncomingWebhooksFormErrors;
    validateName: (name: string) => boolean;
    validateTokenName: (
        tokenGeneration: TokenGeneration,
        name: string,
    ) => boolean;
    validated: boolean;
}

export const IncomingWebhooksForm = ({
    incomingWebhook,
    enabled,
    setEnabled,
    name,
    setName,
    description,
    setDescription,
    tokenGeneration,
    setTokenGeneration,
    tokenName,
    setTokenName,
    errors,
    validateName,
    validateTokenName,
    validated,
}: IIncomingWebhooksFormProps) => {
    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    const showErrors = validated && Object.values(errors).some(Boolean);

    return (
        <div>
            <IncomingWebhooksFormURL name={name} />
            <StyledRaisedSection>
                <FormSwitch checked={enabled} setChecked={setEnabled}>
                    Incoming webhook status
                </FormSwitch>
            </StyledRaisedSection>
            <StyledInputDescription>
                What is your new incoming webhook name?
            </StyledInputDescription>
            <StyledInput
                autoFocus
                label='Incoming webhook name'
                error={Boolean(errors.name)}
                errorText={errors.name}
                value={name}
                onChange={(e) => {
                    validateName(e.target.value);
                    setName(e.target.value);
                }}
                onBlur={(e) => handleOnBlur(() => validateName(e.target.value))}
                autoComplete='off'
            />
            <StyledInputDescription>
                What is your new incoming webhook description?
            </StyledInputDescription>
            <StyledInput
                label='Incoming webhook description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete='off'
            />
            <ConditionallyRender
                condition={incomingWebhook === undefined}
                show={
                    <StyledSecondarySection>
                        <StyledInputDescription>Token</StyledInputDescription>
                        <StyledInputSecondaryDescription>
                            In order to connect your newly created incoming
                            webhook, you will also need a token.{' '}
                            <Link
                                href='https://docs.getunleash.io/reference/api-tokens-and-client-keys'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Read more about API tokens
                            </Link>
                            .
                        </StyledInputSecondaryDescription>
                        <FormControl>
                            <RadioGroup
                                value={tokenGeneration}
                                onChange={(e) => {
                                    const tokenGeneration = e.target
                                        .value as TokenGeneration;

                                    if (validated) {
                                        validateTokenName(
                                            tokenGeneration,
                                            tokenName,
                                        );
                                    }
                                    setTokenGeneration(tokenGeneration);
                                }}
                                name='token-generation'
                            >
                                <FormControlLabel
                                    value={TokenGeneration.LATER}
                                    control={<Radio />}
                                    label='I want to generate a token later'
                                />
                                <FormControlLabel
                                    value={TokenGeneration.NOW}
                                    control={<Radio />}
                                    label='Generate a token now'
                                />
                            </RadioGroup>
                        </FormControl>
                        <StyledInlineContainer>
                            <StyledInputSecondaryDescription>
                                A new incoming webhook token will be generated
                                for the incoming webhook, so you can get started
                                right away.
                            </StyledInputSecondaryDescription>
                            <ConditionallyRender
                                condition={
                                    tokenGeneration === TokenGeneration.NOW
                                }
                                show={
                                    <>
                                        <StyledInputSecondaryDescription>
                                            What is your new token name?
                                        </StyledInputSecondaryDescription>
                                        <StyledInput
                                            autoFocus
                                            label='Token name'
                                            error={Boolean(errors.tokenName)}
                                            errorText={errors.tokenName}
                                            value={tokenName}
                                            onChange={(e) => {
                                                validateTokenName(
                                                    tokenGeneration,
                                                    e.target.value,
                                                );
                                                setTokenName(e.target.value);
                                            }}
                                            autoComplete='off'
                                        />
                                    </>
                                }
                            />
                        </StyledInlineContainer>
                    </StyledSecondarySection>
                }
                elseShow={
                    <>
                        <StyledInputDescription>
                            Incoming webhook tokens
                        </StyledInputDescription>
                        <IncomingWebhooksTokens
                            incomingWebhook={incomingWebhook!}
                        />
                    </>
                }
            />
            <ConditionallyRender
                condition={showErrors}
                show={() => (
                    <Alert severity='error' icon={false}>
                        <ul>
                            {Object.values(errors)
                                .filter(Boolean)
                                .map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                        </ul>
                    </Alert>
                )}
            />
        </div>
    );
};
