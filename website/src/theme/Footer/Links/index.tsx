import { isMultiColumnFooterLinks } from '@docusaurus/theme-common';
import FooterLinksMultiColumn from '@theme/Footer/Links/MultiColumn';
import FooterLinksSimple from '@theme/Footer/Links/Simple';
import type { Props } from '@theme/Footer/Links';

export default function FooterLinks({ links }: Props): JSX.Element {
    return isMultiColumnFooterLinks(links) ? (
        <FooterLinksMultiColumn columns={links} />
    ) : (
        <FooterLinksSimple links={links} />
    );
}
