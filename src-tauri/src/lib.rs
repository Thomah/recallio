use std::fs;
use std::env;
use serde::{Serialize, Deserialize};
use directories;

#[derive(Serialize, Deserialize)]
struct Config {
    path: String,
    interval: Option<u32>,
}

#[tauri::command]
fn save_config(path: String, interval: Option<u32>) -> Result<(), String> {
    let config = Config { path, interval };
    
    // Define the path for the YAML file
    let home_dir = directories::UserDirs::new().ok_or("Could not find home directory")?;
    let config_path = home_dir.home_dir().join(".recallio/config.yaml");
    
    // Create the parent directory if it doesn't exist
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Serialize and write the config to the YAML file
    let yaml = serde_yaml::to_string(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, yaml).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn load_config() -> Result<Config, String> {
    let user_dirs = directories::UserDirs::new().ok_or("Could not find user directories")?;
    let config_path = user_dirs.home_dir().join(".recallio/config.yaml");

    // Read the YAML file if it exists
    if config_path.exists() {
        let contents = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
        let config: Config = serde_yaml::from_str(&contents).map_err(|e| e.to_string())?;
        Ok(config)
    } else {
        Ok(Config {
            path: String::new(),
            interval: None,
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![save_config, load_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
