import fs from "fs";
import { PDFParse } from "pdf-parse";

import {
  RecursiveCharacterTextSplitter
} from "@langchain/textsplitters";

import {
  createVectorStore
} from "../utils/vectorStore.js";

import {
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";

import {
  getModel
} from "../utils/model.js";

import {
  QdrantVectorStore
} from "@langchain/qdrant";


export const pdfRagAgent = async (state) => {

  let collectionName;

  try {

    // =========================
    // STEP 1: READ PDF
    // =========================

    console.log(
      "PDF STEP 1: Reading PDF"
    );

    const buffer =
      fs.readFileSync(
        state.file.path
      );

    console.log(
      "PDF SIZE:",
      buffer.length
    );


    // =========================
    // STEP 2: EXTRACT TEXT
    // =========================

    console.log(
      "PDF STEP 2: Extracting text"
    );

    const pdf =
      new PDFParse({
        data: buffer
      });

    const result =
      await pdf.getText();

    const text =
      result.text;

    console.log(
      "PDF TEXT LENGTH:",
      text.length
    );


    // =========================
    // STEP 3: SPLIT DOCUMENT
    // =========================

    console.log(
      "PDF STEP 3: Splitting document"
    );

    const splitter =
      new RecursiveCharacterTextSplitter({

        chunkSize: 1000,

        chunkOverlap: 200

      });

    const docs =
      await splitter.createDocuments([
        text
      ]);

    console.log(
      "DOCUMENT CHUNKS:",
      docs.length
    );


    // =========================
    // STEP 4: CREATE COLLECTION
    // =========================

    collectionName =
      `pdf-${Date.now()}`;

    console.log(
      "PDF STEP 4: Creating vector store"
    );

    console.log(
      "COLLECTION:",
      collectionName
    );

    const vectorStore =
      await createVectorStore(
        collectionName,
        docs
      );

    console.log(
      "PDF STEP 5: Vector store created"
    );


    // =========================
    // STEP 5: SIMILARITY SEARCH
    // =========================

    console.log(
      "PDF STEP 6: Searching PDF"
    );

    const relevantDocs =
      await vectorStore.similaritySearch(
        state.prompt,
        5
      );

    console.log(
      "RELEVANT DOCS:",
      relevantDocs.length
    );


    // =========================
    // STEP 6: BUILD CONTEXT
    // =========================

    const context =
      relevantDocs
        .map(
          doc => doc.pageContent
        )
        .join("\n\n");


    console.log(
      "CONTEXT LENGTH:",
      context.length
    );


    // =========================
    // STEP 7: CALL LLM
    // =========================

    console.log(
      "PDF STEP 7: Calling PDF RAG model"
    );

    const llm =
      getModel("pdf-rag");


    const messages = [

      new SystemMessage(`

You are CortexAI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.
- Never make up information.
- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.

`),

      new HumanMessage(`

Context:

${context}

Question:

${state.prompt}

`)

    ];


    const response =
      await llm.invoke(
        messages
      );


    console.log(
      "PDF STEP 8: LLM response received"
    );


    // =========================
    // RETURN RESULT
    // =========================

    return {

      ...state,

      docs,

      response:
        response.content

    };


  } catch (error) {

    console.error(
      "========== PDF RAG ERROR =========="
    );

    console.error(
      error
    );

    console.error(
      "===================================="
    );

    throw error;


  } finally {

    // =========================
    // CLEANUP
    // =========================

    try {

      if (
        state.file?.path &&
        fs.existsSync(
          state.file.path
        )
      ) {

        fs.unlinkSync(
          state.file.path
        );

        console.log(
          "Temporary PDF deleted"
        );

      }


      if (collectionName) {

        console.log(
          "Deleting Qdrant collection:",
          collectionName
        );

        await QdrantVectorStore.deleteCollection(
          collectionName
        );

        console.log(
          "Qdrant collection deleted"
        );

      }

    } catch (err) {

      console.error(
        "Cleanup error:",
        err.message
      );

    }

  }

};