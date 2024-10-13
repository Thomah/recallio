import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import { message } from '@tauri-apps/plugin-dialog';
import { Config, Song } from './types';
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState<string>('settings');
  const [interval, setInterval] = useState<number | undefined>(undefined);
  const [jellyfinServer, setJellyfinServer] = useState<string>('');
  const [jellyfinUsername, setJellyfinUsername] = useState<string>('');
  const [jellyfinPassword, setJellyfinPassword] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [jellyfinToken, setJellyfinToken] = useState<string | null>(null);
  const [randomSongUrl, setRandomSongUrl] = useState<string | null>(null);
  const [randomSong, setRandomSong] = useState<Song | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config: Config = await invoke('load_config');
        setInterval(config.interval);
        setJellyfinServer(config.jellyfin.server);
        setJellyfinUsername(config.jellyfin.username);
        setJellyfinToken(config.jellyfin.token);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleMenuClick = (section: string) => {
    setActiveSection(section);
  };

  const handleSave = async () => {
    try {
      const authHeader = `MediaBrowser Client="Recallio", Device="None", DeviceId="None", Version="None"`;

      const response = await fetch(`${jellyfinServer}/Users/AuthenticateByName`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': authHeader,
        },
        body: JSON.stringify({
          Username: jellyfinUsername,
          Pw: jellyfinPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const result = await response.json();
      const accessToken = result.AccessToken;

      if (!accessToken) {
        throw new Error('No access token received from Jellyfin.');
      }

      // Construct the configuration object with the token
      const configData = {
        jellyfin: {
          server: jellyfinServer,
          username: jellyfinUsername,
          token: accessToken,
        },
        interval: interval,
      };

      // Save the configuration data 
      await invoke('save_config', { config: configData });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      // Show success message
      console.log('Configuration saved successfully.');
    } catch (error) {
      console.error('Error connecting to Jellyfin:', error);
      setIsSaved(false);
      await message('Failed to connect to Jellyfin. Check your server or credentials.', 'Test Result');
    }
    try {
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleTestClick = async () => {
  };

  return (
    <div className="app">
      {/* Sidebar Menu */}
      <nav className="sidebar">
        <ul>
          <li
            className={activeSection === 'game' ? 'active' : ''}
            onClick={() => handleMenuClick('game')}
          >
            Game
          </li>
          <li
            className={activeSection === 'settings' ? 'active' : ''}
            onClick={() => handleMenuClick('settings')}
          >
            Settings
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content">

        {activeSection === 'settings' && (
          <div className="container">
            {/* Jellyfin Fields */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="jellyfin-server">Jellyfin Server:</label>
              <input
                type="text"
                id="jellyfin-server"
                className={`wide-input ${isSaved ? 'success' : ''}`}
                value={jellyfinServer}
                onChange={(e) => setJellyfinServer(e.target.value)}
                style={{
                  display: 'block',
                  width: '300px',
                  marginTop: '8px',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="jellyfin-username">Jellyfin Username:</label>
              <input
                type="text"
                id="jellyfin-username"
                className={`wide-input ${isSaved ? 'success' : ''}`}
                value={jellyfinUsername}
                onChange={(e) => setJellyfinUsername(e.target.value)}
                style={{
                  display: 'block',
                  width: '300px',
                  marginTop: '8px',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="jellyfin-password">Jellyfin Password:</label>
              <input
                type="password"
                id="jellyfin-password"
                className={`wide-input ${isSaved ? 'success' : ''}`}
                value={jellyfinPassword}
                onChange={(e) => setJellyfinPassword(e.target.value)}
                style={{
                  display: 'block',
                  width: '300px',
                  marginTop: '8px',
                }}
              />
            </div>

            {/* Interval Field */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="interval">Interval</label>
              <input
                id="interval"
                className={`wide-input ${isSaved ? 'success' : ''}`}
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
              />
            </div>

            <button onClick={handleSave} className="save-button">Save</button>
          </div>
        )}
        {activeSection === 'game' && (
          <div className="container">
            <h2>Game</h2>
            <p>Here you can play the game.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
