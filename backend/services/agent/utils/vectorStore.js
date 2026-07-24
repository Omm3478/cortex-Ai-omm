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
    "\n========== VECTOR STORE DEBUG START =========="
  );

  console.log(
    "Collection:",
    collectionName
  );

  console.log(
    "Documents:",
    docs.length
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
  // TEST GOOGLE EMBEDDINGS
  // ==========================================

  console.log(
    "\n🔵 EMBEDDING TEST START"
  );

  try {

    const vector =
      await embeddings.embedQuery(
        "What is the ATS score?"
      );

    console.log(
      "🟢 EMBEDDING TEST SUCCESS"
    );

    console.log(
      "Embedding dimension:",
      vector.length
    );

  } catch (error) {

    console.error(
      "🔴 EMBEDDING TEST FAILED"
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
      "FULL EMBEDDING ERROR:",
      error
    );

    throw error;

  }


  // ==========================================
  // TEST QDRANT
  // ==========================================

  console.log(
    "\n🟣 QDRANT VECTOR STORE TEST START"
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
      "========== VECTOR STORE DEBUG END ==========\n"
    );

    return vectorStore;

  } catch (error) {

    console.error(
      "🔴 QDRANT VECTOR STORE FAILED"
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
      "FULL QDRANT ERROR:",
      error
    );

    throw error;

  }

};