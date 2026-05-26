import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';
import { FlagUsageSnippet } from './FlagUsageSnippet';

describe('FlagUsageSnippet', () => {
    it('renders the feature name in the snippet', () => {
        render(<FlagUsageSnippet sdkName='Node.js' feature='my-test-flag' />);
        expect(screen.getByText(/my-test-flag/)).toBeInTheDocument();
    });

    it('renders an error when the SDK has no snippet', () => {
        render(
            <FlagUsageSnippet
                sdkName={'Unknown' as SdkName}
                feature='my-test-flag'
            />,
        );
        expect(
            screen.getByText(/missing a flag usage example/i),
        ).toBeInTheDocument();
    });
});
