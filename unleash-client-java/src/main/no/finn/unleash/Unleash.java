package no.finn.unleash;

import java.util.HashMap;
import java.util.Map;
import no.finn.unleash.repository.ToggleException;
import no.finn.unleash.repository.ToggleRepository;
import no.finn.unleash.strategy.DefaultStrategy;
import no.finn.unleash.strategy.Strategy;
import no.finn.unleash.strategy.UnknownStrategy;

public final class Unleash {
    private final ToggleRepository toggleRepository;
    private final Map<String, Strategy> strategyMap;
    private final UnknownStrategy unknownStrategy = new UnknownStrategy();
    private final DefaultStrategy defaultStrategy = new DefaultStrategy();


    public Unleash(ToggleRepository toggleRepository, Strategy... strategies) {
        this.toggleRepository = toggleRepository;
        this.strategyMap = buildStrategyMap(strategies);
    }

    public boolean isEnabled(final String toggleName) {
        return isEnabled(toggleName, false);
    }

    public boolean isEnabled(final String toggleName, final boolean defaultSetting) {
        try {
            Toggle toggle = toggleRepository.getToggle(toggleName);

            if(toggle == null) {
                return defaultSetting;
            }

            Strategy strategy = getStrategy(toggle.getStrategy());
            return toggle.isEnabled() && strategy.isEnabled(toggle.getParameters());

        } catch (ToggleException rx) {
            return defaultSetting;
        }
    }

    private Map<String, Strategy> buildStrategyMap(Strategy[] strategies) {
        Map<String, Strategy> map = new HashMap<>();

        map.put(defaultStrategy.getName(), defaultStrategy);

        if(strategies != null) {
            for(Strategy strategy : strategies) {
                map.put(strategy.getName(), strategy);
            }
        }

        return map;
    }



    private Strategy getStrategy(String strategy) {
        if(strategyMap.containsKey(strategy)) {
            return strategyMap.get(strategy);
        } else {
            return unknownStrategy;
        }
    }
}
