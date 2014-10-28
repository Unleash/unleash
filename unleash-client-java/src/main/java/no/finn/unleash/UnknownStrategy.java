package no.finn.unleash;

import java.util.Map;

final class UnknownStrategy implements Strategy {
    public static final String NAME = "unknown";

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public boolean isEnabled(Map<String, String> parameters) {
        return false;
    }
}
