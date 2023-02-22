import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { FC, FormEvent, useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePersonalAPITokens } from 'hooks/api/getters/usePersonalAPITokens/usePersonalAPITokens';
import { usePersonalAPITokensApi } from 'hooks/api/actions/usePersonalAPITokensApi/usePersonalAPITokensApi';
import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import {
    calculateExpirationDate,
    ExpirationOption,
    IPersonalAPITokenFormErrors,
    PersonalAPITokenForm,
} from './PersonalAPITokenForm/PersonalAPITokenForm';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(4),
    },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const DEFAULT_EXPIRATION = ExpirationOption['30DAYS'];

interface ICreatePersonalAPITokenProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: (token: INewPersonalAPIToken) => void;
}

export const CreatePersonalAPIToken: FC<ICreatePersonalAPITokenProps> = ({
    open,
    setOpen,
    newToken,
}) => {
    const { tokens, refetchTokens } = usePersonalAPITokens();
    const { createPersonalAPIToken, loading } = usePersonalAPITokensApi();
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [description, setDescription] = useState('');
    const [expiration, setExpiration] =
        useState<ExpirationOption>(DEFAULT_EXPIRATION);
    const [expiresAt, setExpiresAt] = useState(
        calculateExpirationDate(DEFAULT_EXPIRATION)
    );
    const [errors, setErrors] = useState<IPersonalAPITokenFormErrors>({});

    useEffect(() => {
        setDescription('');
        setExpiration(DEFAULT_EXPIRATION);
        setExpiresAt(calculateExpirationDate(DEFAULT_EXPIRATION));
        setErrors({});
    }, [open]);

    const getPersonalAPITokenPayload = () => {
        return {
            description,
            expiresAt,
        };
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const token = await createPersonalAPIToken(
                getPersonalAPITokenPayload()
            );
            newToken(token);
            refetchTokens();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/user/tokens' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getPersonalAPITokenPayload(), undefined, 2)}'`;
    };

    const isDescriptionNotEmpty = (description: string) => description.length;
    const isDescriptionUnique = (description: string) =>
        !tokens?.some(token => token.description === description);
    const isValid =
        isDescriptionNotEmpty(description) &&
        isDescriptionUnique(description) &&
        expiresAt > new Date();

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Create personal API token"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Create personal API token"
                description="Use personal API tokens to authenticate to the Unleash API as
                yourself. A personal API token has the same access privileges as
                your user."
                documentationLink="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
                documentationLinkLabel="Tokens documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <PersonalAPITokenForm
                            description={description}
                            setDescription={setDescription}
                            isDescriptionUnique={isDescriptionUnique}
                            expiration={expiration}
                            setExpiration={setExpiration}
                            expiresAt={expiresAt}
                            setExpiresAt={setExpiresAt}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            Create token
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
