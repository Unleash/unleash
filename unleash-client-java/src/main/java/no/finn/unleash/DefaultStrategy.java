package no.finn.unleash;

import java.util.Map;

final class DefaultStrategy implements Strategy {
    public static final String NAME = "default";

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public boolean isEnabled(Map<String, String> parameters) {
        return true;
    }
}
