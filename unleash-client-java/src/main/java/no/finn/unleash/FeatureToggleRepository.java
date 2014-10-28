package no.finn.unleash;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URI;
import java.util.concurrent.*;

public final class FeatureToggleRepository implements ToggleRepository {
    private static final Logger LOG = LogManager.getLogger();

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
            });

    static {
        TIMER.setRemoveOnCancelPolicy(true);
    }

    private final BackupFileHandler featureToggleBackupFileHandler;
    private final ToggleFetcher toggleFetcher;

    private ToggleCollection toggleCollection;

    public FeatureToggleRepository(URI featuresUri, long pollIntervalSeconds) {
        featureToggleBackupFileHandler = new BackupFileHandler();
        toggleFetcher = new HttpToggleFetcher(featuresUri);

        toggleCollection = featureToggleBackupFileHandler.read();
        startBackgroundPolling(pollIntervalSeconds);
    }

    private ScheduledFuture startBackgroundPolling(long pollIntervalSeconds) {
        try {
            return TIMER.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    try {
                        Response response = toggleFetcher.fetchToggles();
                        if (response.getStatus() == Response.Status.CHANGED) {
                            featureToggleBackupFileHandler.write(toggleCollection);
                            toggleCollection = response.getToggleCollection();
                        }
                    } catch (UnleashException e) {
                        LOG.warn("Could not refresh feature toggles", e);
                    }
                }
            }, pollIntervalSeconds, pollIntervalSeconds, TimeUnit.SECONDS);
        } catch (RejectedExecutionException ex) {
            LOG.error("Unleash background task crashed", ex);
            return null;
        }
    }

    @Override
    public Toggle getToggle(String name) {
        return toggleCollection.getToggle(name);
    }
}
