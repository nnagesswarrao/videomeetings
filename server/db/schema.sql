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

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    meeting_id INT,
    sender_id INT NOT NULL,
    recipient_id INT,  -- NULL for messages to everyone
    parent_message_id INT,  -- For thread replies
    message_type ENUM('text', 'file', 'code', 'gif', 'reaction', 'system') DEFAULT 'text',
    message_content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id)
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

-- Attachments table
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
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    recorder_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    file_size BIGINT,
    duration INT,  -- in seconds
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    transcript_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (recorder_id) REFERENCES users(id)
);

-- Meeting settings table
CREATE TABLE IF NOT EXISTS meeting_settings (
    meeting_id INT PRIMARY KEY,
    lobby_enabled BOOLEAN DEFAULT true,
    participant_video BOOLEAN DEFAULT true,
    participant_audio BOOLEAN DEFAULT true,
    allow_chat BOOLEAN DEFAULT true,
    allow_reactions BOOLEAN DEFAULT true,
    allow_raise_hand BOOLEAN DEFAULT true,
    allow_file_sharing BOOLEAN DEFAULT true,
    allow_screen_sharing BOOLEAN DEFAULT true,
    allow_whiteboard BOOLEAN DEFAULT true,
    allow_recording BOOLEAN DEFAULT false,
    allow_transcription BOOLEAN DEFAULT false,
    require_password BOOLEAN DEFAULT false,
    blur_background_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    team_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    time_zone VARCHAR(50),
    recurrence_pattern VARCHAR(100),
    location VARCHAR(255),
    meeting_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
);

-- Calendar event attendees table
CREATE TABLE IF NOT EXISTS calendar_event_attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    response_status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
    response_time TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_event_attendee (event_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    creator_id INT NOT NULL,
    assignee_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('not_started', 'in_progress', 'completed', 'deferred') DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    channel_id INT,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    notification_email BOOLEAN DEFAULT true,
    notification_desktop BOOLEAN DEFAULT true,
    notification_sound BOOLEAN DEFAULT true,
    auto_start_video BOOLEAN DEFAULT false,
    auto_start_audio BOOLEAN DEFAULT true,
    preferred_language VARCHAR(10) DEFAULT 'en',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
