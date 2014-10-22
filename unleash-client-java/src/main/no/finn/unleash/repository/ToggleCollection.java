package no.finn.unleash.repository;

import java.util.ArrayList;
import java.util.Collection;
import no.finn.unleash.Toggle;

public final class ToggleCollection {
    private final Collection<Toggle> features;

    public ToggleCollection(final Collection<Toggle> features) {
        this.features = features;
    }

    public Collection<Toggle> getFeatures() {
        return features;
    }
}
