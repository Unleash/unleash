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
import { IncomingWebhooksTokens } from './IncomingWebhooksTokens/IncomingWebhooksTokens';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledRaisedSection = styled('div')(({ theme }) => ({
    background: theme.palette.background.elevation1,
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledSection = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const StyledSectionLabel = styled('p')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledFieldGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
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

export enum TokenGeneration {
    LATER = 'later',
    NOW = 'now',
}

enum ErrorField {
    NAME = 'name',
    TOKEN_NAME = 'tokenName',
}

export const DEFAULT_INCOMING_WEBHOOKS_FORM_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.TOKEN_NAME]: undefined,
};

export type IncomingWebhooksFormErrors = Record<ErrorField, string | undefined>;

interface IIncomingWebhooksFormProps {
    incomingWebhook?: IIncomingWebhook;
    enabled: boolean;
    name: string;
    description: string;
    tokenGeneration: TokenGeneration;
    tokenName: string;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setTokenGeneration: React.Dispatch<React.SetStateAction<TokenGeneration>>;
    setTokenName: React.Dispatch<React.SetStateAction<string>>;
    errors: IncomingWebhooksFormErrors;
    showErrors: boolean;
    validateName: (name: string) => boolean;
    validateTokenName: (name: string) => boolean;
}

export const IncomingWebhooksForm = ({
    incomingWebhook,
    enabled,
    name,
    description,
    tokenGeneration,
    tokenName,
    setEnabled,
    setName,
    setDescription,
    setTokenGeneration,
    setTokenName,
    errors,
    showErrors,
    validateName,
}: IIncomingWebhooksFormProps) => {
    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    return (
        <StyledForm>
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
                                onChange={(e) =>
                                    setTokenGeneration(
                                        e.target.value as TokenGeneration,
                                    )
                                }
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
                                    // TODO: Can be simplified into a single field:
                                    <IncomingWebhookTokenForm
                                        name={tokenName}
                                        setName={setTokenName}
                                    />
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
                        {/* <IncomingWebhooksTokens
                            incomingWebhook={incomingWebhook!}
                        /> */}
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
        </StyledForm>
    );
};
