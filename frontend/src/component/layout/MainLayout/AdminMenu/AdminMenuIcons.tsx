import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import HomeIcon from '@mui/icons-material/Home';
import LaptopIcon from '@mui/icons-material/Laptop';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BillingIcon from '@mui/icons-material/CreditCardOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SingleSignOnIcon from '@mui/icons-material/AssignmentOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import EmptyIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import type { FC } from 'react';

const icons: Record<string, typeof SvgIcon> = {
    '/admin': HomeIcon,
    users: PeopleOutlineRoundedIcon,
    '/admin/service-accounts': LaptopIcon,
    access: KeyRoundedIcon,
    sso: SingleSignOnIcon,
    '/admin/enterprise-edge': LanguageIcon,
    network: HubOutlinedIcon,
    instance: BuildOutlinedIcon,
    '/admin/billing': BillingIcon,
    '/history': EventNoteIcon,
};

const findIcon = (key: string) => {
    return icons[key] || EmptyIcon;
};

export const IconRenderer: FC<{ path: string; active: boolean }> = ({
    path,
    active = false,
}) => {
    const IconComponent = findIcon(path); // Fallback to 'default' if the type is not found

    return (
        <IconComponent
            sx={(theme) => ({
                color: active ? theme.palette.common.white : 'inherit',
            })}
        />
    );
};
