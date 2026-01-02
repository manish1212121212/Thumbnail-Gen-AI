
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fixed: Initialize GoogleGenAI strictly using process.env.API_KEY as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateImage(prompt: string, aspectRatio: AspectRatio = AspectRatio.PORTRAIT): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Image Generation Error:", error);
      throw error;
    }
  }

  async editImage(base64Image: string, editPrompt: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: editPrompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No edited image data found in response");
    } catch (error) {
      console.error("Image Editing Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
