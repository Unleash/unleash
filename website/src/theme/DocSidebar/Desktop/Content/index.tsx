import Content from '@theme-original/DocSidebar/Desktop/Content';
import type ContentType from '@theme/DocSidebar/Desktop/Content';
import type { WrapperProps } from '@docusaurus/types';
import Link from '@docusaurus/Link';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
    return (
        <>
            <Link to='/' className='sidebar-brand-link'>
                <div className='sidebar-brand-logo' />
            </Link>
            <Content {...props} />
        </>
    );
}
