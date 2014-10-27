package no.finn.unleash.repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import no.finn.unleash.Toggle;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class PollingToggleRepository implements ToggleRepository {
    private static final Log LOG = LogFactory.getLog(PollingToggleRepository.class);
    private static final ScheduledThreadPoolExecutor TIMER = new ScheduledThreadPoolExecutor(
            1,
            new ThreadFactory() {
                @Override
                public Thread newThread(final Runnable r) {
                    Thread thread = Executors.defaultThreadFactory().newThread(r);
                    thread.setName("unleash-toggle-repository");
                    thread.setDaemon(true);
                    return thread;
                }
            }
    );

    static {
        TIMER.setRemoveOnCancelPolicy(true);
    }

    private final ToggleRepository toggleRepository;
    private final int pollIntervalSeconds;
    private Map<String, Toggle> togglesCache;


    public PollingToggleRepository(final ToggleRepository toggleRepository, final int pollIntervalSeconds) {
        this.toggleRepository = toggleRepository;
        this.pollIntervalSeconds = pollIntervalSeconds;

        this.togglesCache = new HashMap<>();
        updateTogglesCache();
        startBackgroundPolling();
    }

    @Override
    public final Toggle getToggle(final String name) {
        return togglesCache.get(name);
    }

    @Override
    public final Collection<Toggle> getToggles() {
        return Collections.unmodifiableCollection(togglesCache.values());
    }

    private void updateTogglesCache() {
        try {
            Map<String, Toggle> freshToggleMap = new HashMap<>();

            for (Toggle toggle : fetchToggles()) {
                freshToggleMap.put(toggle.getName(), toggle);
            }

            this.togglesCache = Collections.unmodifiableMap(freshToggleMap);

        } catch (ToggleException e) {
            //Do nothing
        }
    }

    private ScheduledFuture startBackgroundPolling() {
        try {
            return TIMER.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    updateTogglesCache();
                }
            }, pollIntervalSeconds, pollIntervalSeconds, TimeUnit.SECONDS);
        } catch (RejectedExecutionException ex) {
            LOG.error("Unleash background task crashed");
            return null;
        }
    }


    private Collection<Toggle> fetchToggles() throws ToggleException {
        try {
            Collection<Toggle> toggles = toggleRepository.getToggles();
            storeRepoAsTempFile(JsonToggleParser.toJsonString(toggles));
            return toggles;
        } catch (ToggleException ex) {
            if (togglesCache.isEmpty()) {
                return loadFromTempFile();
            }
            throw ex;
        }
    }


    private Collection<Toggle> loadFromTempFile() throws ToggleException {
        LOG.info("Unleash will try to load feature toggle states from temporary backup");
        try (FileReader reader = new FileReader(pathToTmpBackupFile())) {
            BufferedReader br = new BufferedReader(reader);
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                builder.append(line);
            }
            return JsonToggleParser.fromJson(builder.toString());
        } catch (IOException e) {
            LOG.error("Unleash was unable to feature toggle repo from temporary backup: " + pathToTmpBackupFile());
            throw new ToggleException("Unleash was unable to feature toggle states from temporary backup");
        }
    }

    private void storeRepoAsTempFile(final String serverResponse) {
        try (FileWriter writer = new FileWriter(pathToTmpBackupFile())) {
            writer.write(serverResponse);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String pathToTmpBackupFile() {
        return System.getProperty("java.io.tmpdir") + File.separatorChar + "unleash-repo.json";
    }
}