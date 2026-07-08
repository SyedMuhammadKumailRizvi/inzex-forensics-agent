-- 2. Create Enums
CREATE TYPE os_hint_enum AS ENUM ('windows', 'linux', 'mac');
CREATE TYPE case_status_enum AS ENUM ('pending', 'analyzing', 'completed');
CREATE TYPE upload_status_enum AS ENUM ('uploading', 'complete', 'failed');
CREATE TYPE finding_severity_enum AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Info');
