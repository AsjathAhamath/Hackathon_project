class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // Updated to use gemini-2.0-flash as shown in your curl example
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  }

  validateApiKey() {
    if (!this.apiKey) {
      throw new Error(
        "API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file."
      );
    }
  }

  async generateResponse(prompt) {
    try {
      // Validate API key before making the request
      this.validateApiKey();

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Using X-goog-api-key header as shown in your curl example
          "X-goog-api-key": this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ""
          }`
        );
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid response format from Gemini API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API Error:", error);

      // Re-throw with more user-friendly messages
      if (error.message.includes("API key is not configured")) {
        throw new Error(
          "API key is not configured. Please check your environment variables."
        );
      } else if (error.message.includes("API request failed")) {
        throw new Error(
          "Failed to connect to Gemini API. Please try again later."
        );
      } else {
        throw new Error(
          "Something went wrong with the AI service. Please try again."
        );
      }
    }
  }
}

export default new GeminiService();
