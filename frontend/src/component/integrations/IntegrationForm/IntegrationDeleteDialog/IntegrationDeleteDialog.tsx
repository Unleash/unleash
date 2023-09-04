import { type VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { AddonSchema } from 'openapi';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';

interface IIntegrationDeleteDialogProps {
    id: AddonSchema['id'];
    isOpen: boolean;
    onClose: () => void;
}

export const IntegrationDeleteDialog: VFC<IIntegrationDeleteDialogProps> = ({
    id,
    isOpen,
    onClose,
}) => {
    const { removeAddon } = useAddonsApi();
    const { refetchAddons } = useAddons();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const onSubmit = async () => {
        try {
            await removeAddon(id);
            refetchAddons();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Deleted addon successfully',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
        onClose();
        navigate('/integrations');
    };

    return (
        <Dialogue
            open={isOpen}
            onClick={onSubmit}
            onClose={onClose}
            title="Confirm deletion"
        >
            <div>Are you sure you want to delete this Addon?</div>
        </Dialogue>
    );
};
