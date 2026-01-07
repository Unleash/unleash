import { Button, Checkbox, FormControlLabel, styled } from '@mui/material';
import { Banner } from 'component/banners/Banner/Banner';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import Input from 'component/common/Input/Input';
import type { BannerVariant } from 'interfaces/banner';
import {
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
    useEffect,
    useState,
} from 'react';
import Visibility from '@mui/icons-material/Visibility';
import { BannerDialog } from 'component/banners/Banner/BannerDialog/BannerDialog';

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledBannerPreview = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledBannerPreviewDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
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
}));

const StyledInput = styled(Input)({
    width: '100%',
});

const StyledTooltip = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0.5),
    gap: theme.spacing(0.5),
}));

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledPreviewButton = styled(Button)(({ theme }) => ({
    marginRight: 'auto',
}));

const VARIANT_OPTIONS = [
    { key: 'info', label: 'Information' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
    { key: 'success', label: 'Success' },
];

type IconOption = 'Default' | 'Custom' | 'None';
type LinkOption = 'Link' | 'Dialog' | 'None';

const deriveIconOption = (icon: string): IconOption => {
    if (icon === '') return 'Default';
    if (icon === 'none') return 'None';
    return 'Custom';
};

const deriveLinkOption = (link: string): LinkOption => {
    if (link === '') return 'None';
    if (link === 'dialog') return 'Dialog';
    return 'Link';
};

interface IBannerFormProps {
    enabled: boolean;
    message: string;
    variant: BannerVariant;
    sticky: boolean;
    icon: string;
    link: string;
    linkText: string;
    dialogTitle: string;
    dialog: string;
    setEnabled: Dispatch<SetStateAction<boolean>>;
    setMessage: Dispatch<SetStateAction<string>>;
    setVariant: Dispatch<SetStateAction<BannerVariant>>;
    setSticky: Dispatch<SetStateAction<boolean>>;
    setIcon: Dispatch<SetStateAction<string>>;
    setLink: Dispatch<SetStateAction<string>>;
    setLinkText: Dispatch<SetStateAction<string>>;
    setDialogTitle: Dispatch<SetStateAction<string>>;
    setDialog: Dispatch<SetStateAction<string>>;
}

export const BannerForm = ({
    enabled,
    message,
    variant,
    sticky,
    icon,
    link,
    linkText,
    dialogTitle,
    dialog,
    setEnabled,
    setMessage,
    setVariant,
    setSticky,
    setIcon,
    setLink,
    setLinkText,
    setDialogTitle,
    setDialog,
}: IBannerFormProps) => {
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

    const [iconOption, setIconOption] = useState<IconOption>(() =>
        deriveIconOption(icon),
    );
    const [linkOption, setLinkOption] = useState<LinkOption>(() =>
        deriveLinkOption(link),
    );

    useEffect(() => {
        setIconOption(deriveIconOption(icon));
        setLinkOption(deriveLinkOption(link));
    }, [icon, link]);

    return (
        <StyledForm>
            <StyledBannerPreview>
                <StyledBannerPreviewDescription>
                    Banner preview:
                </StyledBannerPreviewDescription>
                <Banner
                    banner={{
                        message:
                            message ||
                            '*No message set. Please enter a message below.*',
                        variant,
                        sticky: false,
                        icon,
                        link,
                        linkText,
                        dialogTitle,
                        dialog,
                    }}
                    inline
                />
            </StyledBannerPreview>
            <StyledRaisedSection>
                <FormSwitch checked={enabled} setChecked={setEnabled}>
                    Banner status
                </FormSwitch>
            </StyledRaisedSection>
            <StyledSection>
                <StyledSectionLabel>Configuration</StyledSectionLabel>
                <StyledFieldGroup>
                    <StyledInputDescription>
                        What type of banner is it?
                    </StyledInputDescription>
                    <StyledSelect
                        size='small'
                        value={variant}
                        onChange={(variant) =>
                            setVariant(variant as BannerVariant)
                        }
                        options={VARIANT_OPTIONS}
                    />
                </StyledFieldGroup>
                <StyledFieldGroup>
                    <StyledInputDescription>
                        What icon should be displayed on the banner?
                    </StyledInputDescription>
                    <StyledSelect
                        size='small'
                        value={iconOption}
                        onChange={(iconOption) => {
                            setIconOption(iconOption as IconOption);
                            if (iconOption === 'None') {
                                setIcon('none');
                            } else {
                                setIcon('');
                            }
                        }}
                        options={['Default', 'Custom', 'None'].map(
                            (option) => ({
                                key: option,
                                label: option,
                            }),
                        )}
                    />
                </StyledFieldGroup>
                <ConditionallyRender
                    condition={iconOption === 'Custom'}
                    show={
                        <StyledFieldGroup>
                            <StyledInputDescription>
                                Which custom icon?
                                <HelpIcon
                                    htmlTooltip
                                    tooltip={
                                        <StyledTooltip>
                                            <p>
                                                Choose an icon from{' '}
                                                <a
                                                    href='https://fonts.google.com/icons'
                                                    target='_blank'
                                                    rel='noreferrer'
                                                >
                                                    Material Symbols
                                                </a>
                                                .
                                            </p>
                                            <p>
                                                For example, if you want to
                                                display the "Rocket Launch"
                                                icon, you can enter
                                                "rocket_launch" in the field
                                                below.
                                            </p>
                                        </StyledTooltip>
                                    }
                                />
                            </StyledInputDescription>
                            <StyledInput
                                label='Banner icon'
                                value={icon}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setIcon(e.target.value)
                                }
                                autoComplete='off'
                            />
                        </StyledFieldGroup>
                    }
                />
                <StyledFieldGroup>
                    <StyledInputDescription>
                        What is your banner message?
                        <HelpIcon
                            htmlTooltip
                            tooltip={
                                <StyledTooltip>
                                    <p>
                                        <a
                                            href='https://www.markdownguide.org/basic-syntax/'
                                            target='_blank'
                                            rel='noreferrer'
                                        >
                                            Markdown
                                        </a>{' '}
                                        is supported.
                                    </p>
                                </StyledTooltip>
                            }
                        />
                    </StyledInputDescription>
                    <StyledInput
                        autoFocus
                        label='Banner message'
                        multiline
                        minRows={2}
                        maxRows={6}
                        value={message}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setMessage(e.target.value)
                        }
                        autoComplete='off'
                        required
                    />
                </StyledFieldGroup>
            </StyledSection>
            <StyledSection>
                <StyledSectionLabel>Banner action</StyledSectionLabel>
                <StyledFieldGroup>
                    <StyledInputDescription>
                        What action should be available in the banner?
                    </StyledInputDescription>
                    <StyledSelect
                        size='small'
                        value={linkOption}
                        onChange={(linkOption) => {
                            setLinkOption(linkOption as LinkOption);
                            if (linkOption === 'Dialog') {
                                setLink('dialog');
                            } else {
                                setLink('');
                            }
                            setLinkText('');
                            setDialogTitle('');
                            setDialog('');
                        }}
                        options={['None', 'Link', 'Dialog'].map((option) => ({
                            key: option,
                            label: option,
                        }))}
                    />
                </StyledFieldGroup>
                <ConditionallyRender
                    condition={linkOption === 'Link'}
                    show={
                        <StyledFieldGroup>
                            <StyledInputDescription>
                                What URL should be opened?
                            </StyledInputDescription>
                            <StyledInput
                                label='URL'
                                value={link}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setLink(e.target.value)
                                }
                                onBlur={() => {
                                    if (!linkText) setLinkText(link);
                                }}
                                autoComplete='off'
                            />
                        </StyledFieldGroup>
                    }
                />
                <ConditionallyRender
                    condition={linkOption !== 'None'}
                    show={
                        <StyledFieldGroup>
                            <StyledInputDescription>
                                What is the action text?
                            </StyledInputDescription>
                            <StyledInput
                                label='Action text'
                                value={linkText}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setLinkText(e.target.value)
                                }
                                autoComplete='off'
                            />
                        </StyledFieldGroup>
                    }
                />
                <ConditionallyRender
                    condition={linkOption === 'Dialog'}
                    show={
                        <>
                            <StyledFieldGroup>
                                <StyledInputDescription>
                                    What is the dialog title?
                                </StyledInputDescription>
                                <StyledInput
                                    label='Dialog title'
                                    value={dialogTitle}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => setDialogTitle(e.target.value)}
                                    autoComplete='off'
                                />
                            </StyledFieldGroup>
                            <StyledFieldGroup>
                                <StyledInputDescription>
                                    What is the dialog content?
                                    <HelpIcon
                                        htmlTooltip
                                        tooltip={
                                            <StyledTooltip>
                                                <p>
                                                    <a
                                                        href='https://www.markdownguide.org/basic-syntax/'
                                                        target='_blank'
                                                        rel='noreferrer'
                                                    >
                                                        Markdown
                                                    </a>{' '}
                                                    is supported.
                                                </p>
                                            </StyledTooltip>
                                        }
                                    />
                                </StyledInputDescription>
                                <StyledInput
                                    label='Dialog content'
                                    multiline
                                    minRows={4}
                                    value={dialog}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => setDialog(e.target.value)}
                                    autoComplete='off'
                                />
                            </StyledFieldGroup>
                            <StyledPreviewButton
                                variant='outlined'
                                color='primary'
                                startIcon={<Visibility />}
                                onClick={() => setPreviewDialogOpen(true)}
                            >
                                Preview dialog
                            </StyledPreviewButton>
                            <BannerDialog
                                open={previewDialogOpen}
                                setOpen={setPreviewDialogOpen}
                                title={dialogTitle || linkText}
                            >
                                {dialog!}
                            </BannerDialog>
                        </>
                    }
                />
            </StyledSection>
            <StyledSection>
                <StyledSectionLabel>Sticky banner</StyledSectionLabel>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={sticky}
                            onChange={(e) => setSticky(e.target.checked)}
                        />
                    }
                    label='Make the banner sticky on the screen when scrolling'
                />
            </StyledSection>
        </StyledForm>
    );
};
