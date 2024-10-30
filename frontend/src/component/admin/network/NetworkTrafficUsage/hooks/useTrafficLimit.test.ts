import { renderHook } from '@testing-library/react';
import { useTrafficLimit } from './useTrafficLimit';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { vi, describe, it, expect } from 'vitest';

vi.mock('hooks/api/getters/useUiConfig/useUiConfig');
vi.mock('hooks/useUiFlag');

describe('useTrafficLimit', () => {
    it('should return requests limit if user is on pro plan', () => {
        vi.mocked(useUiConfig).mockReturnValue({
            isPro: () => true,
            isEnterprise: () => false,
            uiConfig: {
                billing: 'pay-as-you-go',
            },
        } as any);
        vi.mocked(useUiFlag).mockReturnValue(false);

        const { result } = renderHook(() => useTrafficLimit());

        expect(result.current).toBe(53_000_000);
    });

    it('should return PAYG plan requests limit if enterprise-payg is enabled and billing is pay-as-you-go', () => {
        vi.mocked(useUiConfig).mockReturnValue({
            isPro: () => false,
            isEnterprise: () => true,
            uiConfig: { billing: 'pay-as-you-go' },
        } as any);
        vi.mocked(useUiFlag).mockReturnValue(true);

        const { result } = renderHook(() => useTrafficLimit());

        expect(result.current).toBe(53_000_000);
    });

    it('should return 0 if user is not on pro plan and pay-as-you-go conditions are not met', () => {
        vi.mocked(useUiConfig).mockReturnValue({
            isPro: () => false,
            isEnterprise: () => false,
            uiConfig: {},
        } as any);
        vi.mocked(useUiFlag).mockReturnValue(false);

        const { result } = renderHook(() => useTrafficLimit());

        expect(result.current).toBe(0);
    });

    it('should return 0 if user is not on pro plan and flag is disabled', () => {
        vi.mocked(useUiConfig).mockReturnValue({
            isPro: () => false,
            isEnterprise: () => true,
            uiConfig: { billing: 'pay-as-you-go' },
        } as any);
        vi.mocked(useUiFlag).mockReturnValue(false);

        const { result } = renderHook(() => useTrafficLimit());

        expect(result.current).toBe(0);
    });

    it('should return 0 if enterprise PAYG is enabled but billing is not pay-as-you-go', () => {
        vi.mocked(useUiConfig).mockReturnValue({
            isPro: () => false,
            isEnterprise: () => false,
            uiConfig: { billing: 'subscription' },
        } as any);
        vi.mocked(useUiFlag).mockReturnValue(true);

        const { result } = renderHook(() => useTrafficLimit());

        expect(result.current).toBe(0);
    });
});
