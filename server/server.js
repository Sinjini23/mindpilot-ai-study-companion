import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFParse } from "pdf-parse";

import {
  analyzeStudyMaterial,
  askStudyMaterial,
} from "./services/aiService.js";

import {
  createDocumentEmbeddings,
  findRelevantChunks,
} from "./services/ragService.js";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

// Store the currently uploaded document
// in memory for this POC.
let documentStore = {
  fileName: "",
  text: "",
  chunks: [],
};

// ================= HEALTH =================

app.get("/api/health", (req, res) => {
  res.json({
    message:
      "AI Study Partner backend is running!",
  });
});

// ================= PDF UPLOAD =================

app.post(
  "/api/upload",
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a PDF file.",
        });
      }

      console.log(
        `Processing PDF: ${req.file.originalname}`
      );

      const parser = new PDFParse({
        data: req.file.buffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      const extractedText = result.text;

      console.log(
        `Extracted ${extractedText.length} characters.`
      );

      // Create embeddings for this document.
      const embeddedChunks =
        await createDocumentEmbeddings(
          extractedText
        );

      // Store the document and embeddings.
      documentStore = {
        fileName: req.file.originalname,
        text: extractedText,
        chunks: embeddedChunks,
      };

      console.log(
        `Stored ${embeddedChunks.length} document chunks.`
      );

      res.json({
        message:
          "PDF uploaded successfully!",
        fileName:
          req.file.originalname,
        textLength:
          extractedText.length,
        text: extractedText,
        chunkCount:
          embeddedChunks.length,
      });

    } catch (error) {
      console.error(
        "PDF processing error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to process PDF.",
      });
    }
  }
);

// ================= AI ANALYSIS =================

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message:
          "Study material is required.",
      });
    }

    console.log(
      "Starting AI analysis..."
    );

    const result =
      await analyzeStudyMaterial(text);

    res.json({
      message:
        "AI analysis completed!",
      analysis: result,
    });

  } catch (error) {
    console.error(
      "AI analysis error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to analyze study material.",
    });
  }
});

// ================= ASK MINDPILOT =================

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message:
          "Question is required.",
      });
    }

    if (!documentStore.chunks.length) {
      return res.status(400).json({
        message:
          "Please upload a study document first.",
      });
    }

    console.log(
      "Ask MindPilot request received."
    );

    console.log(
      "Question:",
      question
    );

    // ============================
    // SEMANTIC RETRIEVAL
    // ============================

    const relevantChunks =
      await findRelevantChunks(
        documentStore.chunks,
        question,
        3
      );

    console.log(
      "Retrieved relevant chunks:"
    );

    relevantChunks.forEach(
      (item, index) => {
        console.log(
          `Chunk ${index + 1} similarity:`,
          item.score.toFixed(4)
        );
      }
    );

    // Only send the retrieved context
    // to Gemini.
    const context =
      relevantChunks
        .map((item) => item.text)
        .join(
          "\n\n--- SOURCE CHUNK ---\n\n"
        );

    // ============================
    // GEMINI
    // ============================

    const answer =
      await askStudyMaterial(
        context,
        question
      );

    res.json({
      message:
        "Question answered successfully!",

      answer,

      sources: relevantChunks.map(
        (item) => ({
          text: item.text,
          similarity: item.score,
        })
      ),
    });

  } catch (error) {
    console.error(
      "Ask AI error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to answer the question.",
    });
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}`
  );
});