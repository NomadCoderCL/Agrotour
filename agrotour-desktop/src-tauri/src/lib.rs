// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai_service;

use ai_service::{AIRequest, AIResponse, AIService};
use tauri::State;
use std::sync::Mutex;

struct AppState {
    ai_service: Mutex<AIService>,
}

#[tauri::command]
async fn ai_chat(
    prompt: String,
    context: Option<String>,
    state: State<'_, AppState>,
) -> Result<AIResponse, String> {
    let ai_service = state.ai_service.lock().unwrap();
    
    let request = AIRequest {
        prompt,
        context,
    };

    ai_service.chat(request).await
}

#[tauri::command]
async fn ai_analyze_stock(
    product_name: String,
    sales_data: String,
    current_stock: i32,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let ai_service = state.ai_service.lock().unwrap();
    ai_service.analyze_stock(&product_name, &sales_data, current_stock).await
}

#[tauri::command]
async fn ai_generate_description(
    product_name: String,
    category: String,
    features: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let ai_service = state.ai_service.lock().unwrap();
    ai_service.generate_description(&product_name, &category, &features).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            ai_service: Mutex::new(AIService::new()),
        })
        .invoke_handler(tauri::generate_handler![
            ai_chat,
            ai_analyze_stock,
            ai_generate_description
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
