import { useUiFlag } from 'hooks/useUiFlag';
import { CreateFeatureForm } from 'component/feature/CreateFeature/CreateFeatureForm.tsx';
import { LegacyCreateFeatureForm } from 'component/feature/CreateFeature/LegacyCreateFeatureForm.tsx';

export type CreateFeatureDialogProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export const CreateFeatureDialog = (props: CreateFeatureDialogProps) => {
    const perFlagLifetime = useUiFlag('perFlagLifetime');

    if (!props.open) {
        return null;
    }

    return perFlagLifetime ? (
        <CreateFeatureForm {...props} />
    ) : (
        <LegacyCreateFeatureForm {...props} />
    );
};
