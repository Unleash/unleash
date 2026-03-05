import { Alert, Chip, Collapse } from '@mui/material';
import type { FC } from 'react';

type RegexSdkRequirementsBannerProps = {
    open: boolean;
    onClose: () => void;
};

export const RegexSdkRequirementsBanner: FC<
    RegexSdkRequirementsBannerProps
> = ({ open, onClose }) => (
    <Collapse in={open}>
        <Alert severity='info' icon={false} onClose={onClose} sx={{ mb: 2 }}>
            Regex requires these SDK versions or newer: Node.js 6.10.0, Java
            12.2.0, Ruby 6.5.0, Python 6.6.0, .NET 6.1.0, Go 6.2.0 - or a
            frontend SDK connected to Unleash or Unleash Enterpirse Edge
            20.1.10.
        </Alert>
    </Collapse>
);

type RegexSdkRequirementsToggleProps = {
    open: boolean;
    onOpen: () => void;
};

export const RegexSdkRequirementsToggle: FC<
    RegexSdkRequirementsToggleProps
> = ({ open, onOpen }) => {
    if (open) return null;
    return (
        <Chip
            size='small'
            variant='outlined'
            label='SDK requirements'
            aria-label='Show SDK version requirements'
            onClick={onOpen}
        />
    );
};
