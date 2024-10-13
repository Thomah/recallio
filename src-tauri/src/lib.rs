use directories;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;

#[derive(Serialize, Deserialize)]
struct JellyfinConfig {
    server: String,
    username: String,
    token: String,
}

#[derive(Serialize, Deserialize)]
struct Config {
    interval: Option<u32>,
    jellyfin: JellyfinConfig,
}

#[tauri::command]
fn save_config(config: Config) -> Result<(), String> {
    let home_dir = directories::UserDirs::new()
        .and_then(|dirs| dirs.home_dir().to_path_buf().into())
        .ok_or("Could not find home directory")?;
    let config_dir = home_dir.join(".recallio");
    let config_path = config_dir.join("config.yaml");

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    let yaml = serde_yaml::to_string(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, yaml).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn load_config() -> Result<Config, String> {
    // Retrieve the home directory using directories crate
    let home_dir = directories::UserDirs::new()
        .and_then(|dirs| dirs.home_dir().to_path_buf().into())
        .ok_or("Could not find home directory")?;

    // Construct the path to the config file
    let config_path = home_dir.join(".recallio").join("config.yaml");

    // Check if the config file exists
    if !config_path.exists() {
        return Err("Config file does not exist".to_string());
    }

    // Read the contents of the config file
    let config_contents = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;

    // Parse the YAML content into a Config struct
    let config: Config = serde_yaml::from_str(&config_contents).map_err(|e| e.to_string())?;

    Ok(config)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![save_config, load_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
