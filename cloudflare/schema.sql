-- Daily index reads. `visitors` only dedupes readers within a day and keeps no IPs.
CREATE TABLE IF NOT EXISTS reads (day TEXT PRIMARY KEY, reads INTEGER NOT NULL DEFAULT 0, readers INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS visitors (day TEXT NOT NULL, hash TEXT NOT NULL, PRIMARY KEY (day, hash));
