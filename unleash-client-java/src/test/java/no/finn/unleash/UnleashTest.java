package no.finn.unleash;

import no.finn.unleash.repository.ToggleException;
import no.finn.unleash.repository.ToggleRepository;
import no.finn.unleash.strategy.Strategy;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;

public class UnleashTest {

    private ToggleRepository toggleRepository;
    private Unleash unleash;

    @Before
    public void setup() {
        toggleRepository = mock(ToggleRepository.class);
        unleash = new Unleash(toggleRepository);
    }

    @Test
    public void known_toogle_and_strategy_should_be_active() {
        when(toggleRepository.getToggle("test")).thenReturn(new Toggle("test", true, "default", null));

        assertThat(unleash.isEnabled("test"), is(true));
    }

    @Test
    public void unknown_strategy_should_be_considered_inactive() {
        when(toggleRepository.getToggle("test")).thenReturn(new Toggle("test", true, "whoot_strat", null));

        assertThat(unleash.isEnabled("test"), is(false));
    }

    @Test
    public void failing_repository_should_obey_default() {
        when(toggleRepository.getToggle("test")).thenThrow(new ToggleException("service down"));

        assertThat(unleash.isEnabled("test", true), is(true));
    }

    @Test
    public void unknown_feature_should_be_considered_inactive() {
        when(toggleRepository.getToggle("test")).thenReturn(null);

        assertThat(unleash.isEnabled("test"), is(false));
    }

    @Test
    public void should_register_custom_strategies() {
        //custom strategy
        Strategy customStrategy = mock(Strategy.class);
        when(customStrategy.getName()).thenReturn("custom");

        //register custom strategy
        unleash = new Unleash(toggleRepository, customStrategy);
        when(toggleRepository.getToggle("test")).thenReturn(new Toggle("test", true, "custom", null));

        unleash.isEnabled("test");

        verify(customStrategy, times(1)).isEnabled(anyMap());
    }
}
