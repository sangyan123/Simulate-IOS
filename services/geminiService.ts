import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSiriResponse = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are Siri, a helpful, witty, and concise AI assistant living in an iOS interface. Keep answers short, conversational, and helpful. Do not use markdown formatting like bold or headers, just plain text.",
      }
    });
    return response.text || "I'm having trouble connecting to the network right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, something went wrong.";
  }
};

export const generateMessageReply = async (history: { role: string, content: string }[], contactName: string): Promise<string> => {
  try {
    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // We only send the last user message as the prompt, relying on previous context implicitly or simplifying for this demo
    const lastMessage = history[history.length - 1].content;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Reply to this message as if you are my friend named ${contactName}. Keep it casual, maybe use an emoji. Message: "${lastMessage}"`,
    });
    return response.text || "Haha sounds good!";
  } catch (error) {
    return "Received.";
  }
};