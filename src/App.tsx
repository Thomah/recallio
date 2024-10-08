import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import { message } from '@tauri-apps/plugin-dialog';
import { Config } from './types';
import "./App.css";

async function loadConfig(): Promise<Config> {
  try {
    const config: Config = await invoke<Config>('load_config');
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return { path: '', interval: undefined }; // Default config
  }
}

async function saveConfig(path: string, interval?: number) {
  try {
    await invoke('save_config', { path, interval });
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function App() {
  const [path, setPath] = useState<string>('');
  const [interval, setInterval] = useState<number | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await loadConfig();
        setPath(config.path);
        setInterval(config.interval);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      await saveConfig(path, interval);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving config:', error);
      setIsSaved(false);
    }
  };

  const handleTestClick = async () => {
    await message('File not found', { title: 'Tauri', kind: 'error' });
};

  return (
    <div className="container">

      <label htmlFor="music-library-path">Music Library Path</label>
      <input
        id="music-library-path"
        className={`wide-input ${isSaved ? 'success' : ''}`}
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Enter the path to your music library..."
      />
      <label htmlFor="interval">Interval</label>
      <input
        id="interval"
        className={`wide-input ${isSaved ? 'success' : ''}`}
        type="number"
        value={interval}
        onChange={(e) => setInterval(e.target.value ? parseInt(e.target.value) : undefined)}
        min="0"
      />
      <button onClick={handleSave} className="save-button">Save</button>
      <button onClick={handleTestClick}>Test</button>
    </div>
  );
}

export default App;
