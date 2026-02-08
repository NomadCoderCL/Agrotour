use ollama_rs::{
    generation::completion::request::GenerationRequest,
    Ollama,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
    pub context: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub response: String,
    pub model: String,
}

pub struct AIService {
    ollama: Ollama,
    model: String,
}

impl AIService {
    pub fn new() -> Self {
        Self {
            ollama: Ollama::default(),
            model: "qwen2.5:3b-instruct".to_string(),
        }
    }

    fn build_prompt(&self, user_query: &str, context: Option<&str>) -> String {
        let system_context = context.unwrap_or("Eres un asistente agrícola experto para Agrotour.");
        
        format!(
            "<|im_start|>system\n{}\n<|im_end|>\n<|im_start|>user\n{}\n<|im_end|>\n<|im_start|>assistant",
            system_context, user_query
        )
    }

    pub async fn chat(&self, request: AIRequest) -> Result<AIResponse, String> {
        let full_prompt = self.build_prompt(
            &request.prompt,
            request.context.as_deref(),
        );

        let generation_request = GenerationRequest::new(
            self.model.clone(),
            full_prompt,
        );

        match self.ollama.generate(generation_request).await {
            Ok(response) => Ok(AIResponse {
                response: response.response,
                model: self.model.clone(),
            }),
            Err(e) => Err(format!("Ollama error: {}", e)),
        }
    }

    pub async fn analyze_stock(&self, product_name: &str, sales_data: &str, current_stock: i32) -> Result<String, String> {
        let context = "Eres un experto en análisis de inventario agrícola. Proporciona recomendaciones concretas y accionables.";
        
        let prompt = format!(
            "Analiza el siguiente producto:\n\
            - Producto: {}\n\
            - Ventas últimos 30 días: {}\n\
            - Stock actual: {} unidades\n\n\
            Recomienda:\n\
            1. ¿Debo aumentar o reducir stock?\n\
            2. ¿Cuál es el momento óptimo de cosecha/reposición?\n\
            3. Precio sugerido basado en demanda.",
            product_name, sales_data, current_stock
        );

        let request = AIRequest {
            prompt,
            context: Some(context.to_string()),
        };

        let response = self.chat(request).await?;
        Ok(response.response)
    }

    pub async fn generate_description(&self, product_name: &str, category: &str, features: &str) -> Result<String, String> {
        let context = "Eres un copywriter especializado en productos agrícolas. Crea descripciones atractivas y SEO-optimizadas.";
        
        let prompt = format!(
            "Genera una descripción atractiva para:\n\
            - Producto: {}\n\
            - Categoría: {}\n\
            - Características: {}\n\n\
            Máximo 150 palabras, enfocado en beneficios para el cliente.",
            product_name, category, features
        );

        let request = AIRequest {
            prompt,
            context: Some(context.to_string()),
        };

        let response = self.chat(request).await?;
        Ok(response.response)
    }
}
