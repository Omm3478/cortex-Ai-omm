import fs from "fs";
import crypto from "crypto";
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


export const pdfRagAgent = async (state) => {

  // ==========================================
  // REQUEST ID FOR DEBUGGING
  // ==========================================

  const requestId =
    crypto.randomUUID();

  console.log(
    "\n\n=========================================="
  );

  console.log(
    "🔥 PDF RAG AGENT STARTED"
  );

  console.log(
    "REQUEST ID:",
    requestId
  );

  console.log(
    "=========================================="
  );


  try {

    // ==========================================
    // STEP 0: CHECK STATE
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 0: Checking state`
    );

    console.log(
      `[${requestId}] Prompt:`,
      state?.prompt
    );

    console.log(
      `[${requestId}] Agent:`,
      state?.agent
    );

    console.log(
      `[${requestId}] File exists:`,
      !!state?.file
    );


    if (!state?.file) {

      throw new Error(
        "PDF RAG ERROR: state.file is missing"
      );

    }


    console.log(
      `[${requestId}] File path:`,
      state.file.path
    );

    console.log(
      `[${requestId}] File mimetype:`,
      state.file.mimetype
    );

    console.log(
      `[${requestId}] File original name:`,
      state.file.originalname
    );


    // ==========================================
    // STEP 1: READ PDF
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 1: Reading PDF`
    );


    if (
      !fs.existsSync(
        state.file.path
      )
    ) {

      throw new Error(
        `PDF file does not exist: ${state.file.path}`
      );

    }


    const buffer =
      fs.readFileSync(
        state.file.path
      );


    console.log(
      `[${requestId}] PDF SIZE:`,
      buffer.length,
      "bytes"
    );


    console.log(
      `[${requestId}] STEP 1 SUCCESS`
    );


    // ==========================================
    // STEP 2: EXTRACT PDF TEXT
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 2: Extracting PDF text`
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
      `[${requestId}] PDF TEXT LENGTH:`,
      text?.length
    );


    if (
      !text ||
      text.trim().length === 0
    ) {

      throw new Error(
        "PDF text extraction returned empty text. The PDF may be scanned or image-based."
      );

    }


    console.log(
      `[${requestId}] STEP 2 SUCCESS`
    );


    // ==========================================
    // STEP 3: SPLIT DOCUMENT
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 3: Splitting document`
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
      `[${requestId}] DOCUMENT CHUNKS:`,
      docs.length
    );


    if (
      !docs ||
      docs.length === 0
    ) {

      throw new Error(
        "Text splitter returned zero document chunks."
      );

    }


    console.log(
      `[${requestId}] STEP 3 SUCCESS`
    );


    // ==========================================
    // STEP 4: CREATE UNIQUE COLLECTION NAME
    // ==========================================

    const collectionName =
      `pdf-${Date.now()}-${requestId.slice(0, 8)}`;


    console.log(
      `\n[${requestId}] STEP 4: Creating vector store`
    );


    console.log(
      `[${requestId}] COLLECTION:`,
      collectionName
    );


    console.log(
      `[${requestId}] GOOGLE_API_KEY exists:`,
      !!process.env.GOOGLE_API_KEY
    );


    console.log(
      `[${requestId}] QDRANT_URL exists:`,
      !!process.env.QDRANT_URL
    );


    console.log(
      `[${requestId}] QDRANT_API_KEY exists:`,
      !!process.env.QDRANT_API_KEY
    );


    // ==========================================
    // CREATE VECTOR STORE
    // ==========================================

    let vectorStore;


    try {

      console.log(
        `[${requestId}] Calling createVectorStore()`
      );


      vectorStore =
        await createVectorStore(
          collectionName,
          docs
        );


      console.log(
        `[${requestId}] STEP 4 SUCCESS: Vector store created`
      );


    } catch (error) {

      console.error(
        `\n[${requestId}] ❌ VECTOR STORE ERROR`
      );


      console.error(
        `[${requestId}] Error name:`,
        error?.name
      );


      console.error(
        `[${requestId}] Error message:`,
        error?.message
      );


      console.error(
        `[${requestId}] Error code:`,
        error?.code
      );


      console.error(
        `[${requestId}] Error cause:`,
        error?.cause
      );


      console.error(
        `[${requestId}] Full error:`,
        error
      );


      throw error;

    }


    // ==========================================
    // STEP 5: SIMILARITY SEARCH
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 5: Starting similarity search`
    );


    console.log(
      `[${requestId}] Search query:`,
      state.prompt
    );


    let relevantDocs;


    try {

      relevantDocs =
        await vectorStore.similaritySearch(
          state.prompt,
          5
        );


      console.log(
        `[${requestId}] SIMILARITY SEARCH SUCCESS`
      );


      console.log(
        `[${requestId}] Relevant documents:`,
        relevantDocs.length
      );


    } catch (error) {

      console.error(
        `\n[${requestId}] ❌ SIMILARITY SEARCH ERROR`
      );


      console.error(
        `[${requestId}] Error name:`,
        error?.name
      );


      console.error(
        `[${requestId}] Error message:`,
        error?.message
      );


      console.error(
        `[${requestId}] Error code:`,
        error?.code
      );


      console.error(
        `[${requestId}] Error cause:`,
        error?.cause
      );


      console.error(
        `[${requestId}] Full error:`,
        error
      );


      throw error;

    }


    // ==========================================
    // STEP 6: BUILD CONTEXT
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 6: Building context`
    );


    const context =
      relevantDocs
        .map(
          doc =>
            doc.pageContent
        )
        .join("\n\n");


    console.log(
      `[${requestId}] CONTEXT LENGTH:`,
      context.length
    );


    console.log(
      `[${requestId}] STEP 6 SUCCESS`
    );


    // ==========================================
    // STEP 7: GET PDF RAG MODEL
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 7: Getting PDF RAG model`
    );


    let llm;


    try {

      llm =
        getModel(
          "pdf-rag"
        );


      console.log(
        `[${requestId}] PDF RAG MODEL CREATED`
      );


    } catch (error) {

      console.error(
        `\n[${requestId}] ❌ MODEL CREATION ERROR`
      );


      console.error(
        `[${requestId}] Error name:`,
        error?.name
      );


      console.error(
        `[${requestId}] Error message:`,
        error?.message
      );


      console.error(
        `[${requestId}] Full error:`,
        error
      );


      throw error;

    }


    // ==========================================
    // STEP 8: CALL PDF RAG LLM
    // ==========================================

    console.log(
      `\n[${requestId}] STEP 8: Calling PDF RAG LLM`
    );


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


    let response;


    try {

      response =
        await llm.invoke(
          messages
        );


      console.log(
        `[${requestId}] STEP 8 SUCCESS: LLM response received`
      );


      console.log(
        `[${requestId}] Response length:`,
        response?.content?.length
      );


    } catch (error) {

      console.error(
        `\n[${requestId}] ❌ LLM FETCH ERROR`
      );


      console.error(
        `[${requestId}] Error name:`,
        error?.name
      );


      console.error(
        `[${requestId}] Error message:`,
        error?.message
      );


      console.error(
        `[${requestId}] Error code:`,
        error?.code
      );


      console.error(
        `[${requestId}] Error cause:`,
        error?.cause
      );


      console.error(
        `[${requestId}] Full error:`,
        error
      );


      throw error;

    }


    // ==========================================
    // STEP 9: FINAL SUCCESS
    // ==========================================

    console.log(
      `\n==========================================`
    );


    console.log(
      `[${requestId}] 🎉 PDF RAG COMPLETED SUCCESSFULLY`
    );


    console.log(
      `[${requestId}] ==========================================`
    );


    return {

      ...state,

      docs,

      response:
        response.content

    };


  } catch (error) {


    // ==========================================
    // FINAL ERROR
    // ==========================================

    console.error(
      `\n\n==========================================`
    );


    console.error(
      `🔥 PDF RAG FINAL ERROR`
    );


    console.error(
      `REQUEST ID:`,
      requestId
    );


    console.error(
      `ERROR NAME:`,
      error?.name
    );


    console.error(
      `ERROR MESSAGE:`,
      error?.message
    );


    console.error(
      `ERROR CODE:`,
      error?.code
    );


    console.error(
      `ERROR CAUSE:`,
      error?.cause
    );


    console.error(
      `FULL ERROR:`,
      error
    );


    console.error(
      `==========================================\n\n`
    );


    throw error;


  } finally {


    // ==========================================
    // CLEANUP
    // ==========================================

    console.log(
      `\n[${requestId}] STARTING CLEANUP`
    );


    // ==========================================
    // DELETE TEMPORARY PDF ONLY
    // ==========================================

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
          `[${requestId}] Temporary PDF deleted`
        );


      } else {

        console.log(
          `[${requestId}] Temporary PDF already missing`
        );

      }


    } catch (err) {

      console.error(
        `[${requestId}] ❌ PDF CLEANUP FAILED`
      );


      console.error(
        `[${requestId}] Cleanup error name:`,
        err?.name
      );


      console.error(
        `[${requestId}] Cleanup error message:`,
        err?.message
      );


      console.error(
        `[${requestId}] Full cleanup error:`,
        err
      );

    }


    // ==========================================
    // IMPORTANT:
    //
    // DO NOT CALL:
    //
    // QdrantVectorStore.deleteCollection()
    //
    // because @langchain/qdrant v1.0.3
    // does not expose that static method.
    //
    // The Qdrant collection is intentionally
    // NOT deleted here while debugging.
    // ==========================================


    console.log(
      `[${requestId}] QDRANT CLEANUP SKIPPED`
    );


    console.log(
      `[${requestId}] CLEANUP FINISHED`
    );


    console.log(
      `==========================================\n`
    );

  }

};