import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import StandaloneLayout from 'component/user/common/StandaloneLayout';
import StandaloneBanner from 'component/user/StandaloneBanner';
import useLoading from 'hooks/useLoading';

interface INewUserWrapperProps {
    loading?: boolean;
    title?: string;
    children?: React.ReactNode;
}

export const NewUserWrapper: FC<INewUserWrapperProps> = ({
    children,
    loading,
    title,
}) => {
    const ref = useLoading(loading || false);

    return (
        <div ref={ref}>
            <StandaloneLayout
                showMenu={false}
                BannerComponent={<StandaloneBanner title={'Unleash'} />}
            >
                <Box
                    sx={{
                        width: ['100%', '350px'],
                    }}
                >
                    {title ? (
                        <Typography
                            component='h2'
                            sx={{
                                fontSize: (theme) => theme.fontSizes.mainHeader,
                                marginBottom: 2,
                                textAlign: 'center',
                                fontWeight: (theme) => theme.fontWeight.bold,
                            }}
                        >
                            {title}
                        </Typography>
                    ) : null}
                    {children}
                </Box>
            </StandaloneLayout>
        </div>
    );
};
