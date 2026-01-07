import { Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { type FormEvent, useEffect, useState } from 'react';
import type { BannerVariant, IInternalBanner } from 'interfaces/banner';
import { useBanners } from 'hooks/api/getters/useBanners/useBanners';
import {
    type AddOrUpdateBanner,
    useBannersApi,
} from 'hooks/api/actions/useBannersApi/useBannersApi';
import { BannerForm } from './BannerForm.tsx';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

interface IBannerModalProps {
    banner?: IInternalBanner;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BannerModal = ({ banner, open, setOpen }: IBannerModalProps) => {
    const { refetch } = useBanners();
    const { addBanner, updateBanner, loading } = useBannersApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [enabled, setEnabled] = useState(true);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState<BannerVariant>('info');
    const [sticky, setSticky] = useState(false);
    const [icon, setIcon] = useState('');
    const [link, setLink] = useState('');
    const [linkText, setLinkText] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialog, setDialog] = useState('');

    useEffect(() => {
        setEnabled(banner?.enabled ?? true);
        setMessage(banner?.message || '');
        setVariant(banner?.variant || 'info');
        setSticky(banner?.sticky || false);
        setIcon(banner?.icon || '');
        setLink(banner?.link || '');
        setLinkText(banner?.linkText || '');
        setDialogTitle(banner?.dialogTitle || '');
        setDialog(typeof banner?.dialog === 'string' ? banner?.dialog : '');
    }, [open, banner]);

    const editing = banner !== undefined;
    const title = editing ? 'Edit banner' : 'New banner';
    const isValid = message.length;

    const payload: AddOrUpdateBanner = {
        enabled,
        variant,
        icon,
        message,
        link,
        linkText,
        dialogTitle,
        dialog,
        sticky,
    };

    const formatApiCode = () => {
        return `curl --location --request ${editing ? 'PUT' : 'POST'} '${
            uiConfig.unleashUrl
        }/api/admin/banners${editing ? `/${banner.id}` : ''}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        try {
            if (editing) {
                await updateBanner(banner.id, payload);
            } else {
                await addBanner(payload);
            }
            setToastData({
                text: `Banner ${editing ? 'updated' : 'added'} successfully`,
                type: 'success',
            });
            refetch();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading}
                modal
                title={title}
                description='Banners allow you to display messages to other users inside your Unleash instance.'
                documentationLink='https://docs.getunleash.io/concepts/banners'
                documentationLinkLabel='Banners documentation'
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={onSubmit}>
                    <BannerForm
                        enabled={enabled}
                        message={message}
                        variant={variant}
                        sticky={sticky}
                        icon={icon}
                        link={link}
                        linkText={linkText}
                        dialogTitle={dialogTitle}
                        dialog={dialog}
                        setEnabled={setEnabled}
                        setMessage={setMessage}
                        setVariant={setVariant}
                        setSticky={setSticky}
                        setIcon={setIcon}
                        setLink={setLink}
                        setLinkText={setLinkText}
                        setDialogTitle={setDialogTitle}
                        setDialog={setDialog}
                    />
                    <StyledButtonContainer>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
                            disabled={!isValid}
                        >
                            {editing ? 'Save' : 'Add'} banner
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
