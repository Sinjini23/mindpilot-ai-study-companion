import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Keep the chunks reasonably small so retrieval
// can find focused pieces of the document.
function chunkText(text, chunkSize = 1200, overlap = 200) {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length
    );

    const chunk = text
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

// Create an embedding for a piece of text.
async function createEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings[0].values;
}

// Calculate cosine similarity between two vectors.
function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  const denominator =
    Math.sqrt(magnitudeA) *
    Math.sqrt(magnitudeB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

// Create vector representations for all document chunks.
async function createDocumentEmbeddings(text) {
  const chunks = chunkText(text);

  console.log(
    `Creating embeddings for ${chunks.length} chunks...`
  );

  const embeddedChunks = [];

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    embeddedChunks.push({
      text: chunk,
      embedding,
    });
  }

  console.log("Document embeddings created.");

  return embeddedChunks;
}

// Find the chunks most semantically related
// to the user's question.
async function findRelevantChunks(
  embeddedChunks,
  question,
  topK = 3
) {
  const questionEmbedding =
    await createEmbedding(question);

  const scoredChunks = embeddedChunks.map(
    (item) => ({
      text: item.text,

      score: cosineSimilarity(
        questionEmbedding,
        item.embedding
      ),
    })
  );

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export {
  chunkText,
  createDocumentEmbeddings,
  findRelevantChunks,
};