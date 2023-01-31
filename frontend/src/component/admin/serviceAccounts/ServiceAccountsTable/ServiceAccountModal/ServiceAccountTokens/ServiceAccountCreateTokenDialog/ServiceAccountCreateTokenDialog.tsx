import { useEffect, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {
    calculateExpirationDate,
    ExpirationOption,
    IPersonalAPITokenFormErrors,
    PersonalAPITokenForm,
} from 'component/user/Profile/PersonalAPITokensTab/CreatePersonalAPIToken/PersonalAPITokenForm/PersonalAPITokenForm';
import { ICreateServiceAccountTokenPayload } from 'hooks/api/actions/useServiceAccountTokensApi/useServiceAccountTokensApi';
import { IPersonalAPIToken } from 'interfaces/personalAPIToken';

const DEFAULT_EXPIRATION = ExpirationOption['30DAYS'];

interface IServiceAccountCreateTokenDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    tokens: IPersonalAPIToken[];
    onCreateClick: (newToken: ICreateServiceAccountTokenPayload) => void;
}

export const ServiceAccountCreateTokenDialog = ({
    open,
    setOpen,
    tokens,
    onCreateClick,
}: IServiceAccountCreateTokenDialogProps) => {
    const [patDescription, setPatDescription] = useState('');
    const [patExpiration, setPatExpiration] =
        useState<ExpirationOption>(DEFAULT_EXPIRATION);
    const [patExpiresAt, setPatExpiresAt] = useState(
        calculateExpirationDate(DEFAULT_EXPIRATION)
    );
    const [patErrors, setPatErrors] = useState<IPersonalAPITokenFormErrors>({});

    useEffect(() => {
        setPatDescription('');
        setPatExpiration(DEFAULT_EXPIRATION);
        setPatExpiresAt(calculateExpirationDate(DEFAULT_EXPIRATION));
        setPatErrors({});
    }, [open]);

    const isDescriptionUnique = (description: string) =>
        !tokens?.some(token => token.description === description);

    const isPATValid =
        patDescription.length &&
        isDescriptionUnique(patDescription) &&
        patExpiresAt > new Date();

    return (
        <Dialogue
            open={open}
            primaryButtonText="Create token"
            secondaryButtonText="Cancel"
            onClick={() =>
                onCreateClick({
                    description: patDescription,
                    expiresAt: patExpiresAt,
                })
            }
            disabledPrimaryButton={!isPATValid}
            onClose={() => {
                setOpen(false);
            }}
            title="New token"
        >
            <PersonalAPITokenForm
                description={patDescription}
                setDescription={setPatDescription}
                isDescriptionUnique={isDescriptionUnique}
                expiration={patExpiration}
                setExpiration={setPatExpiration}
                expiresAt={patExpiresAt}
                setExpiresAt={setPatExpiresAt}
                errors={patErrors}
                setErrors={setPatErrors}
            />
        </Dialogue>
    );
};
