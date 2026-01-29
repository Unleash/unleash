import { styled } from '@mui/material';
import { formatAssetPath } from 'utils/formatPath';
import ReleaseTemplatePreviewImage from 'assets/img/releaseTemplatePreview.png';
import type { Flag } from 'hooks/useUiFlag.ts';

const StyledImg = styled('img')(() => ({
    maxWidth: '100%',
}));

export type NewInUnleashItem = {
    label: string;
    summary: string;
    longDescription?: string;
    preview: React.ReactNode;
    filter: {
        flag?: Flag;
        enterpriseOnly?: boolean;
        versionLowerThan: string;
    };
    appLink?: string;
    docsLink?: string;
    beta?: boolean;
    modal?: boolean;
};

export const newInUnleashItems: NewInUnleashItem[] = [
    {
        label: 'Release templates',
        summary: 'Put your rollouts on autopilot',
        preview: (
            <StyledImg
                src={formatAssetPath(ReleaseTemplatePreviewImage)}
                alt='Release templates preview'
            />
        ),
        appLink: '?splash=release-management-v3',
        docsLink: 'https://docs.getunleash.io/reference/release-templates',
        filter: {
            enterpriseOnly: true,
            versionLowerThan: '7.5.0',
        },
        beta: false,
        modal: false,
    },
];
