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
            Regex requires these SDK versions or newer: Node v6.9.7, Java TODO,
            Ruby TODO, Python TODO, Rust TODO, Go TODO — or a frontend SDK
            connected to Unleash TODO or Edge TODO.
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
