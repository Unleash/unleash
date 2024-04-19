import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from '@docusaurus/theme-common/internal';
import GitHubContributors from './contributors';

export default function FooterWrapper(props) {
    const { metadata } = useDoc();
    const file = metadata?.editUrl?.replace(
        'https://github.com/Unleash/unleash/edit/main/',
        '',
    );

    return (
        <>
            <Footer {...props} />
            {metadata.editUrl && <GitHubContributors filePath={file} />}
        </>
    );
}
