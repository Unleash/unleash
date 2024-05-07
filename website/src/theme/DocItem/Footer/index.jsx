// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from '@docusaurus/theme-common/internal';
import GitHubContributors from './GitHubContributors';
import GitUrlParse from 'git-url-parse';

export default function FooterWrapper(props) {
    const { metadata } = useDoc();
    const file = metadata.editUrl;

    if (!file) {
        return <Footer {...props} />;
    }

    const info = GitUrlParse(file);
    const { name, owner, filepath } = info;

    return (
        <>
            <Footer {...props} />
            <GitHubContributors repo={name} owner={owner} filePath={filepath} />
        </>
    );
}
