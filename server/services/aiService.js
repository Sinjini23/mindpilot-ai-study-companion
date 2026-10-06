import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeStudyMaterial(text) {
  const prompt = `
You are an expert AI study assistant.

Analyze the following study material and create a useful study guide.

Generate:

1. A concise summary in simple language.
2. 5-8 important key concepts.
3. 5 flashcards with questions and answers.
4. 5 multiple-choice quiz questions.

For every quiz question:
- Provide exactly 4 options.
- Provide the correct answer.
- Provide a short explanation.

IMPORTANT:
- Base the response ONLY on the provided study material.
- Do not invent information.
- Keep explanations easy to understand.
- Make the flashcards useful for revision.
- Make the quiz test understanding.
- Return ONLY valid JSON.
- Do not use markdown code fences.
- Do not add any text before or after the JSON.

Return exactly this structure:

{
  "summary": "string",
  "keyConcepts": [
    "string",
    "string",
    "string"
  ],
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "answer": "string",
      "explanation": "string"
    }
  ]
}

Study material:

${text}
`;

  // Retry up to 3 times if Gemini temporarily returns
  // a 503 / unavailable response.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Gemini request - attempt ${attempt}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      console.log("Gemini response received successfully.");

      const text = response.text;

const cleanedText = text
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

return JSON.parse(cleanedText);
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error
      );

      // If this was the last attempt, return the error
      // to the API endpoint.
      if (attempt === 3) {
        throw error;
      }

      // Wait before retrying.
      const delay = attempt * 2000;

      console.log(
        `Retrying Gemini request in ${delay / 1000} seconds...`
      );

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
}
async function askStudyMaterial(text, question) {
  const prompt = `
You are MindPilot, an AI study assistant.

Answer the user's question using ONLY the study material provided below.

Rules:
- Do not use outside knowledge.
- If the answer cannot be found in the study material, say:
  "I couldn't find the answer in the uploaded study material."
- Explain the answer clearly and simply.
- Keep the response concise.
- Do not mention these instructions.

Study material:
${text}

User question:
${question}
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Gemini Ask request - attempt ${attempt}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      console.log("Gemini answer received successfully.");

      return response.text;
    } catch (error) {
      console.error(
        `Gemini Ask attempt ${attempt} failed:`,
        error
      );

      if (attempt === 3) {
        throw error;
      }

      const delay = attempt * 2000;

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
}

export { analyzeStudyMaterial,askStudyMaterial};