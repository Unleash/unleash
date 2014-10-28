package no.finn.unleash.example;

import no.finn.unleash.FeatureToggleRepository;
import no.finn.unleash.ToggleRepository;
import no.finn.unleash.Unleash;
import org.junit.Test;

import java.net.URI;

import static org.junit.Assert.assertFalse;

public class UnleashUsageTest {

    @Test
    public void wire() {
        ToggleRepository repository = new FeatureToggleRepository(URI.create("http://localhost:4242/features"), 1);

        Unleash unleash = new Unleash(repository, new CustomStrategy());

        assertFalse(unleash.isEnabled("myFeature"));
    }
}
