import { GridDemo } from '../ClosedDemo.tsx';
import { UnleashChromeMock } from './UnleashChromeMock.tsx';

/**
 * Framing 1 - the demo as a full Unleash page: real sidebar/logo chrome with the
 * grid tour filling the content area, as if it were a screen in the product.
 */
export const PageFrame = () => (
    <UnleashChromeMock title='Get started'>
        <GridDemo />
    </UnleashChromeMock>
);
