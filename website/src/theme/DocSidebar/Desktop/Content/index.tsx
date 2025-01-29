import Content from '@theme-original/DocSidebar/Desktop/Content';
import type ContentType from '@theme/DocSidebar/Desktop/Content';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
    return (
        <>
            <a
                href='https://www.getunleash.io/'
                target='_blank'
                rel='noopener noreferrer'
                className='sidebar-brand-link'
            >
                <div className='sidebar-brand-logo' />
            </a>
            <Content {...props} />
        </>
    );
}
