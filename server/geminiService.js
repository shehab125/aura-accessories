const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini AI Service for Aura Accessories.
 * Self-healing model selection: tries 1.5-flash then falls back to pro.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTIONS = `
You are the Aura Accessories AI Assistant ("Aura Expert"). 
You are an expert in premium handcrafted jewelry and accessories in Egypt.
Your tone is elegant, helpful, and professional.
You speak both Arabic and English fluently (Egyptian dialect preferred when speaking Arabic).

Scope:
1. Product Information: Necklaces, rings, earrings, bracelets, and custom designs.
2. Materials: Discuss gold (18k, 21k), silver (925 sterling), titanium, leather, and gemstones.
3. Care: Provide tips on how to keep jewelry shiny and safe.
4. Logistics: Free shipping over EGP 500, 14-day returns, and authentic guarantee.
5. Brand Philosophy: Aura Accessories is about craftsmanship and amplifying unique energy.

If you are asked about something outside of jewelry/accessories or Aura business, politely decline and provide a helpful bridge back to Aura products.
If you don't know an answer, suggest the user contact the Aura team directly via the contact form.

Keep responses concise and formatted with bullet points if helpful.
`;

// Helper to get a working model
async function getModel() {
    try {
        // Try the latest flash model
        return genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: SYSTEM_INSTRUCTIONS 
        });
    } catch (e) {
        console.warn("Flash model failed to initialize, falling back to gemini-pro", e);
        return genAI.getGenerativeModel({ model: "gemini-pro" });
    }
}

/**
 * Handle chat requests.
 * @param {string} prompt - User message.
 * @param {Array} history - Previous messages.
 */
async function getChatResponse(prompt, history = []) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }

        const model = await getModel();

        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.parts[0].text || h.parts[0].text }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Final Error:", error);
        
        // Final fallback: single generation without history if chat fails
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await fallbackModel.generateContent(SYSTEM_INSTRUCTIONS + "\n\nUser: " + prompt);
            return result.response.text();
        } catch (innerError) {
            throw error;
        }
    }
}

module.exports = { getChatResponse };
