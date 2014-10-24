package no.finn.unleash.repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

class FeatureToggleBackupFileHandler {
    private static final Logger LOG = LogManager.getLogger();
    private static final String BACKUP_FILE =
            System.getProperty("java.io.tmpdir") + File.separatorChar + "unleash-repo.json";


    ToggleCollection readBackupFile() {
        LOG.info("Unleash will try to load feature toggle states from temporary backup");
        try(FileReader reader = new FileReader(BACKUP_FILE)) {
            BufferedReader br = new BufferedReader(reader);
            return JsonToggleParser.collectionFormJson(br);
        } catch (IOException e) {
            //TODO: error if file corrupt, warning if file not found.
            LOG.warn("Unleash was unable to feature toggle states from temporary backup", e);
            return new ToggleCollection(Collections.emptyList());
        }
    }

    void write(ToggleCollection toggleCollection) {
        try(FileWriter writer = new FileWriter(BACKUP_FILE)) {
            writer.write(JsonToggleParser.toJsonString(toggleCollection));
        } catch (IOException e) {
            LOG.warn("Unleash was unable to backup feature toggles to file: {}", BACKUP_FILE, e);
        }
    }
}
