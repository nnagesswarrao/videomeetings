-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS video_meeting;
USE video_meeting;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    job_title VARCHAR(100),
    department VARCHAR(100),
    profile_picture VARCHAR(255),
    status ENUM('available', 'busy', 'do_not_disturb', 'be_right_back', 'offline') DEFAULT 'available',
    status_message VARCHAR(255),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL,
    team_picture VARCHAR(255),
    visibility ENUM('public', 'private') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_team_member (team_id, user_id)
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('general', 'announcement', 'private') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_channel_name (team_id, name)
);

-- Channel members table
CREATE TABLE IF NOT EXISTS channel_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_channel_member (channel_id, user_id)
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id VARCHAR(100) NOT NULL UNIQUE,
    host_id INT NOT NULL,
    team_id INT,
    channel_id INT,
    meeting_name VARCHAR(100) NOT NULL,
    description TEXT,
    meeting_type ENUM('instant', 'scheduled', 'channel', 'webinar') DEFAULT 'instant',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    recurrence_pattern VARCHAR(100),
    time_zone VARCHAR(50),
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    password VARCHAR(100),
    max_participants INT DEFAULT 100,
    recording_enabled BOOLEAN DEFAULT false,
    transcription_enabled BOOLEAN DEFAULT false,
    chat_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('host', 'co-host', 'presenter', 'attendee') DEFAULT 'attendee',
    join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leave_time TIMESTAMP,
    device_info VARCHAR(255),
    connection_status ENUM('connected', 'disconnected', 'waiting') DEFAULT 'waiting',
    video_enabled BOOLEAN DEFAULT true,
    audio_enabled BOOLEAN DEFAULT true,
    hand_raised BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_meeting_participant (meeting_id, user_id)
);

-- Chat messages table with enhanced features
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    meeting_id INT,
    sender_id INT NOT NULL,
    recipient_id INT,  -- NULL for messages to everyone
    parent_message_id INT,  -- For thread replies
    message_type ENUM('text', 'file', 'code', 'gif', 'reaction', 'system', 'link') DEFAULT 'text',
    message_content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    read_by_users JSON,  -- Store JSON of user IDs who have read the message
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id)
);

-- Message thread tracking
CREATE TABLE IF NOT EXISTS message_threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    root_message_id INT NOT NULL,
    last_reply_id INT,
    reply_count INT DEFAULT 0,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (root_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (last_reply_id) REFERENCES chat_messages(id) ON DELETE SET NULL
);

-- Enhanced attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    meeting_id INT,
    chat_message_id INT,
    uploader_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    preview_text TEXT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    download_count INT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- Notes table with enhanced collaboration features
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    version_number INT DEFAULT 1,
    is_shared BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    tags JSON,
    visibility ENUM('private', 'team', 'channel', 'public') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Note collaborators and permissions
CREATE TABLE IF NOT EXISTS note_collaborators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    permission ENUM('view', 'edit', 'comment', 'admin') DEFAULT 'view',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_note_collaborator (note_id, user_id)
);

-- Note version history
CREATE TABLE IF NOT EXISTS note_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    version_number INT NOT NULL,
    content LONGTEXT,
    editor_id INT NOT NULL,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (editor_id) REFERENCES users(id),
    UNIQUE KEY unique_note_version (note_id, version_number)
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_message_reaction (message_id, user_id, reaction_type)
);

-- Meeting Controls Table
CREATE TABLE IF NOT EXISTS meeting_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    control_type ENUM(
        'audio_mute', 
        'video_mute', 
        'screen_share', 
        'recording', 
        'chat', 
        'participant_list', 
        'raise_hand', 
        'background_blur'
    ) NOT NULL,
    user_id INT NOT NULL,  -- User who initiated the control
    target_user_id INT,  -- User the control affects (can be NULL for global controls)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
);

-- Participant Advanced Settings
CREATE TABLE IF NOT EXISTS participant_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    is_audio_muted BOOLEAN DEFAULT false,
    is_video_muted BOOLEAN DEFAULT false,
    is_screen_sharing BOOLEAN DEFAULT false,
    is_hand_raised BOOLEAN DEFAULT false,
    background_blur_level ENUM('none', 'low', 'medium', 'high') DEFAULT 'none',
    microphone_device VARCHAR(255),
    camera_device VARCHAR(255),
    speaker_device VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_meeting_participant_settings (meeting_id, user_id)
);

-- Screen Sharing Sessions
CREATE TABLE IF NOT EXISTS screen_sharing_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    sharer_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    screen_type ENUM('entire_screen', 'application', 'browser_tab') DEFAULT 'entire_screen',
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (sharer_id) REFERENCES users(id)
);

-- Meeting Permissions and Roles
CREATE TABLE IF NOT EXISTS meeting_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('organizer', 'presenter', 'attendee', 'guest') DEFAULT 'attendee',
    can_mute_others BOOLEAN DEFAULT false,
    can_remove_participants BOOLEAN DEFAULT false,
    can_start_recording BOOLEAN DEFAULT false,
    can_share_screen BOOLEAN DEFAULT true,
    can_use_whiteboard BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_meeting_user_permissions (meeting_id, user_id)
);

-- Raised Hands Tracking
CREATE TABLE IF NOT EXISTS raised_hands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    raised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    addressed_at TIMESTAMP,
    status ENUM('pending', 'addressed', 'ignored') DEFAULT 'pending',
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Meeting Recording Controls
CREATE TABLE IF NOT EXISTS recording_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    started_by_user_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status ENUM('recording', 'paused', 'stopped') DEFAULT 'recording',
    storage_location VARCHAR(255),
    file_size BIGINT,
    duration INT,  -- in seconds
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (started_by_user_id) REFERENCES users(id)
);

-- Whiteboard Sessions
CREATE TABLE IF NOT EXISTS whiteboard_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    creator_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    whiteboard_data LONGTEXT,  -- JSON or serialized whiteboard content
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Participant Lobby Management
CREATE TABLE IF NOT EXISTS lobby_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('waiting', 'admitted', 'denied') DEFAULT 'waiting',
    admitted_by_user_id INT,
    admitted_time TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admitted_by_user_id) REFERENCES users(id)
);
