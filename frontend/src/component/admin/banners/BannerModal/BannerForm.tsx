import { styled } from '@mui/material';
import { Banner } from 'component/banners/Banner/Banner';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FormSwitch } from 'component/common/FormSwitch/FormSwitch';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import Input from 'component/common/Input/Input';
import { BannerVariant } from 'interfaces/banner';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
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

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

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

const VARIANT_OPTIONS = [
    { key: 'info', label: 'Information' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
    { key: 'success', label: 'Success' },
];

type IconOption = 'Default' | 'Custom' | 'None';
type LinkOption = 'Link' | 'Dialog' | 'None';

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
    const [iconOption, setIconOption] = useState<IconOption>(
        icon === '' ? 'Default' : icon === 'none' ? 'None' : 'Custom',
    );
    const [linkOption, setLinkOption] = useState<LinkOption>(
        link === '' ? 'None' : link === 'dialog' ? 'Dialog' : 'Link',
    );

    return (
        <StyledForm>
            <StyledFieldGroup>
                <StyledInputDescription>Preview:</StyledInputDescription>
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
            </StyledFieldGroup>
            <StyledFieldGroup>
                <StyledInputDescription>
                    What is your banner message?
                    <HelpIcon
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
                    value={message}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setMessage(e.target.value)
                    }
                    autoComplete='off'
                    required
                />
            </StyledFieldGroup>
            <StyledFieldGroup>
                <StyledInputDescription>
                    What type of banner is it?
                </StyledInputDescription>
                <StyledSelect
                    size='small'
                    value={variant}
                    onChange={(variant) => setVariant(variant as BannerVariant)}
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
                    options={['Default', 'Custom', 'None'].map((option) => ({
                        key: option,
                        label: option,
                    }))}
                />
                <ConditionallyRender
                    condition={iconOption === 'Custom'}
                    show={
                        <>
                            <StyledInputDescription>
                                What custom icon should be displayed?
                                <HelpIcon
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
                        </>
                    }
                />
            </StyledFieldGroup>
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
                <ConditionallyRender
                    condition={linkOption === 'Link'}
                    show={
                        <>
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
                        </>
                    }
                />
                <ConditionallyRender
                    condition={linkOption !== 'None'}
                    show={
                        <>
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
                        </>
                    }
                />
                <ConditionallyRender
                    condition={linkOption === 'Dialog'}
                    show={
                        <>
                            <StyledInputDescription>
                                What is the dialog title?
                            </StyledInputDescription>
                            <StyledInput
                                label='Dialog title'
                                value={dialogTitle}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setDialogTitle(e.target.value)
                                }
                                autoComplete='off'
                            />
                            <StyledInputDescription>
                                What is the dialog content?
                                <HelpIcon
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
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setDialog(e.target.value)
                                }
                                autoComplete='off'
                            />
                        </>
                    }
                />
            </StyledFieldGroup>
            <StyledFieldGroup>
                <StyledInputDescription>
                    Is the banner sticky on the screen when scrolling?
                </StyledInputDescription>
                <FormSwitch
                    checked={sticky}
                    setChecked={setSticky}
                    sx={{
                        justifyContent: 'start',
                    }}
                />
            </StyledFieldGroup>
            <StyledFieldGroup>
                <StyledInputDescription>
                    Is the banner currently enabled?
                </StyledInputDescription>
                <FormSwitch
                    checked={enabled}
                    setChecked={setEnabled}
                    sx={{
                        justifyContent: 'start',
                    }}
                />
            </StyledFieldGroup>
        </StyledForm>
    );
};
