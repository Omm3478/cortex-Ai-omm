import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding.js";

export const createVectorStore = async (
  collectionName,
  docs
) => {

  console.log("========== VECTOR STORE START ==========");

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

  // --------------------------------
  // TEST GOOGLE EMBEDDINGS
  // --------------------------------

  console.log(
    "1. Testing Google Embeddings..."
  );

  try {

    const vector =
      await embeddings.embedQuery(
        "What is the ATS score?"
      );

    console.log(
      "2. Google Embeddings SUCCESS"
    );

    console.log(
      "Embedding dimension:",
      vector.length
    );

  } catch (error) {

    console.error(
      "❌ Google Embeddings FAILED"
    );

    console.error(
      error
    );

    throw error;

  }

  // --------------------------------
  // TEST QDRANT
  // --------------------------------

  console.log(
    "3. Creating Qdrant Vector Store..."
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
      "4. Qdrant Vector Store SUCCESS"
    );

    return vectorStore;

  } catch (error) {

    console.error(
      "❌ Qdrant Vector Store FAILED"
    );

    console.error(
      error
    );

    throw error;

  }

};