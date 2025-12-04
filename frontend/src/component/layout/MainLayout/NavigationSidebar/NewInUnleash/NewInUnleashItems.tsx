import { styled } from '@mui/material';
import { formatAssetPath } from 'utils/formatPath';
import ReleaseTemplatePreviewImage from 'assets/img/releaseTemplatePreview.png';

const StyledImg = styled('img')(() => ({
    maxWidth: '100%',
}));

export type NewInUnleashItem = {
    label: string;
    summary: string;
    longDescription?: string;
    preview: React.ReactNode;
    filter: {
        flag?: string;
        enterpriseOnly?: boolean;
        versionLowerThan: string;
    };
    appLink?: string;
    docsLink?: string;
    beta: boolean;
    modal?: boolean;
};

export const newInUnleashItems: NewInUnleashItem[] = [
    {
        label: 'Release templates',
        summary: 'Faster and safer rollouts with release management',
        preview: (
            <StyledImg
                src={formatAssetPath(ReleaseTemplatePreviewImage)}
                alt='Release templates preview'
            />
        ),
        appLink: '/release-templates',
        docsLink: 'https://docs.getunleash.io/reference/release-templates',
        filter: {
            enterpriseOnly: true,
            versionLowerThan: '7.4.0',
        },
        beta: false,
        modal: true,
    },
];
