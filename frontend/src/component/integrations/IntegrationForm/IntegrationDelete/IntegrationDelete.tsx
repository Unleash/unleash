import { useState, type VFC } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { AddonSchema } from 'openapi';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DELETE_ADDON } from 'component/providers/AccessProvider/permissions';
import { StyledHelpText, StyledTitle } from '../IntegrationForm.styles';

interface IIntegrationDeleteProps {
    id: AddonSchema['id'];
}

const StyledContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 0, 6),
    display: 'flex',
    justifyContent: 'flex-end',
}));

export const IntegrationDelete: VFC<IIntegrationDeleteProps> = ({ id }) => {
    const [isOpen, setIsOpen] = useState(false);
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
        navigate('/integrations');
    };

    return (
        <>
            <StyledTitle>Delete integration</StyledTitle>
            <StyledHelpText>
                Deleting an integration instance will delete all its
                configuration. It will stop working immediately. Other instances
                of the same integration are unaffected.
            </StyledHelpText>
            <StyledContainer>
                <PermissionButton
                    type='button'
                    variant='outlined'
                    color='error'
                    permission={DELETE_ADDON}
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(true);
                    }}
                >
                    Delete integration
                </PermissionButton>
            </StyledContainer>
            <Dialogue
                open={isOpen}
                onClick={onSubmit}
                onClose={() => setIsOpen(false)}
                title='Confirm deletion'
            >
                <div>Are you sure you want to delete this Integration?</div>
            </Dialogue>
        </>
    );
};
