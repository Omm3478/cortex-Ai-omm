import {
  QdrantVectorStore
} from "@langchain/qdrant";

import {
  embeddings
} from "./embedding.js";


export const createVectorStore = async (
  collectionName,
  docs
) => {

  console.log(
    "\n=========================================="
  );

  console.log(
    "🔥 VECTOR STORE DEBUG START"
  );

  console.log(
    "=========================================="
  );


  // ==========================================
  // ENVIRONMENT CHECK
  // ==========================================

  console.log(
    "Collection name:",
    collectionName
  );


  console.log(
    "Documents:",
    docs?.length
  );


  console.log(
    "GOOGLE_API_KEY exists:",
    !!process.env.GOOGLE_API_KEY
  );


  console.log(
    "QDRANT_URL:",
    process.env.QDRANT_URL
  );


  console.log(
    "QDRANT_API_KEY exists:",
    !!process.env.QDRANT_API_KEY
  );


  // ==========================================
  // STEP 1: TEST GOOGLE EMBEDDINGS
  // ==========================================

  console.log(
    "\n🔵 STEP 1: Testing Google Embeddings"
  );


  try {

    const vector =
      await embeddings.embedQuery(
        "What is the ATS score?"
      );


    console.log(
      "🟢 GOOGLE EMBEDDINGS SUCCESS"
    );


    console.log(
      "Embedding dimension:",
      vector.length
    );


  } catch (error) {

    console.error(
      "\n🔴 GOOGLE EMBEDDINGS FAILED"
    );


    console.error(
      "Error name:",
      error?.name
    );


    console.error(
      "Error message:",
      error?.message
    );


    console.error(
      "Error code:",
      error?.code
    );


    console.error(
      "Error cause:",
      error?.cause
    );


    console.error(
      "Full Google Embeddings error:",
      error
    );


    throw error;

  }


  // ==========================================
  // STEP 2: CREATE QDRANT VECTOR STORE
  // ==========================================

  console.log(
    "\n🟣 STEP 2: Creating Qdrant Vector Store"
  );


  try {

    const vectorStore =
      await QdrantVectorStore.fromDocuments(

        docs,

        embeddings,

        {

          url:
            process.env.QDRANT_URL,

          apiKey:
            process.env.QDRANT_API_KEY,

          collectionName

        }

      );


    console.log(
      "🟢 QDRANT VECTOR STORE SUCCESS"
    );


    console.log(
      "Collection created:",
      collectionName
    );


    console.log(
      "\n=========================================="
    );


    console.log(
      "🔥 VECTOR STORE DEBUG END"
    );


    console.log(
      "==========================================\n"
    );


    return vectorStore;


  } catch (error) {

    console.error(
      "\n🔴 QDRANT VECTOR STORE FAILED"
    );


    console.error(
      "Error name:",
      error?.name
    );


    console.error(
      "Error message:",
      error?.message
    );


    console.error(
      "Error code:",
      error?.code
    );


    console.error(
      "Error cause:",
      error?.cause
    );


    console.error(
      "Full Qdrant error:",
      error
    );


    throw error;

  }

};