package no.finn.unleash.strategy;

import java.util.Map;

public interface Strategy {
    String getName();

    boolean isEnabled(Map<String, String> parameters);
}
