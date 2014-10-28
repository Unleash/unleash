package no.finn.unleash;

import java.util.HashMap;
import java.util.Map;

public final class Unleash {
    private static final DefaultStrategy DEFAULT_STRATEGY = new DefaultStrategy();
    private static final UnknownStrategy UNKNOWN_STRATEGY = new UnknownStrategy();

    private final ToggleRepository toggleRepository;
    private final Map<String, Strategy> strategyMap;

    public Unleash(ToggleRepository toggleRepository, Strategy... strategies) {
        this.toggleRepository = toggleRepository;
        this.strategyMap = buildStrategyMap(strategies);
    }

    public boolean isEnabled(final String toggleName) {
        return isEnabled(toggleName, false);
    }

    public boolean isEnabled(final String toggleName, final boolean defaultSetting) {
        Toggle toggle = toggleRepository.getToggle(toggleName);

        if (toggle == null) {
            return defaultSetting;
        }

        Strategy strategy = getStrategy(toggle.getStrategy());
        return toggle.isEnabled() && strategy.isEnabled(toggle.getParameters());
    }

    private Map<String, Strategy> buildStrategyMap(Strategy[] strategies) {
        Map<String, Strategy> map = new HashMap<>();

        map.put(DEFAULT_STRATEGY.getName(), DEFAULT_STRATEGY);

        if (strategies != null) {
            for (Strategy strategy : strategies) {
                map.put(strategy.getName(), strategy);
            }
        }

        return map;
    }


    private Strategy getStrategy(String strategy) {
        if (strategyMap.containsKey(strategy)) {
            return strategyMap.get(strategy);
        } else {
            return UNKNOWN_STRATEGY;
        }
    }
}
