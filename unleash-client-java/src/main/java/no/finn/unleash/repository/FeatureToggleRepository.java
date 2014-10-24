package no.finn.unleash.repository;

import java.net.URI;
import java.util.Collection;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import no.finn.unleash.Toggle;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

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

    private final FeatureToggleBackupFileHandler featureToggleBackupFileHandler;
    private final ToggleFetcher toggleFetcher;

    private ToggleCollection toggleCollection;

    public FeatureToggleRepository(URI featuresUri, long pollIntervalSeconds) {
        featureToggleBackupFileHandler = new FeatureToggleBackupFileHandler();
        toggleFetcher = new HttpToggleFetcher(featuresUri);

        toggleCollection = featureToggleBackupFileHandler.readBackupFile();
        startBackgroundPolling(pollIntervalSeconds);
    }

    private ScheduledFuture startBackgroundPolling(long pollIntervalSeconds) {
        try {
            return TIMER.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    ToggleResponse response = toggleFetcher.fetchToggles();
                    if(response.getStatus() == ToggleResponse.Status.CHANGED) {
                        featureToggleBackupFileHandler.write(toggleCollection);
                        toggleCollection = response.getToggleCollection();
                    }
                }
            }, pollIntervalSeconds, pollIntervalSeconds, TimeUnit.SECONDS);
        } catch (RejectedExecutionException ex) {
            LOG.error("Unleash background task crashed");
            return null;
        }
    }

    @Override
    public Toggle getToggle(String name) throws ToggleException {
        return toggleCollection.getToggle(name);
    }

    @Override
    public Collection<Toggle> getToggles() throws ToggleException {
        return null;
    }
}
