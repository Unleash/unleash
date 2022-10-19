import { styled } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useAchievements } from 'hooks/api/getters/useAchievements/useAchievements';
import { AchievementCard } from './AchievementCard/AchievementCard';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const AchievementsTab = () => {
    const { achievements, all = [], loading } = useAchievements();

    return (
        <PageContent isLoading={loading} header="Achievements">
            <StyledForm>
                {Object.values(all)?.map(definition => (
                    <AchievementCard
                        key={definition.id}
                        definition={definition}
                        achievement={achievements?.find(
                            ({ achievementId }) =>
                                achievementId === definition.id
                        )}
                    />
                ))}
            </StyledForm>
        </PageContent>
    );
};
