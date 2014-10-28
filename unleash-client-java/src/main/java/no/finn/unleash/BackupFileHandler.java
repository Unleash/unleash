package no.finn.unleash;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.util.Collections;

class BackupFileHandler {
    private static final Logger LOG = LogManager.getLogger();
    private static final String BACKUP_FILE =
            System.getProperty("java.io.tmpdir") + File.separatorChar + "unleash-repo.json";


    ToggleCollection read() {
        LOG.info("Unleash will try to load feature toggle states from temporary backup");
        try (FileReader reader = new FileReader(BACKUP_FILE)) {
            BufferedReader br = new BufferedReader(reader);
            return JsonToggleParser.fromJson(br);
        } catch (FileNotFoundException e) {
            LOG.warn("Unable to locate backup file:'{}'", BACKUP_FILE, e);
        } catch (IOException e) {
            LOG.error("Failed to read backup file:'{}'", BACKUP_FILE, e);
        }
        return new ToggleCollection(Collections.emptyList());
    }

    void write(ToggleCollection toggleCollection) {
        try (FileWriter writer = new FileWriter(BACKUP_FILE)) {
            writer.write(JsonToggleParser.toJsonString(toggleCollection));
        } catch (IOException e) {
            LOG.warn("Unleash was unable to backup feature toggles to file: {}", BACKUP_FILE, e);
        }
    }
}
