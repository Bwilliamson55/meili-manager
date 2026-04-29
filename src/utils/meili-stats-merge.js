/**
 * Normalize GET /indexes/{uid}/stats and GET /stats payload `indexes.{uid}` entries into one shape.
 *
 * @param {Record<string, unknown> | null | undefined} st
 */
export function normalizeMeiliIndexStats(st) {
  if (!st || typeof st !== "object") {
    return null;
  }
  const fieldDistribution =
    st.fieldDistribution && typeof st.fieldDistribution === "object"
      ? st.fieldDistribution
      : {};

  const numberOfEmbeddedDocumentsRaw =
    st.numberOfEmbeddedDocuments ?? st.number_of_embedded_documents;
  const numberOfEmbeddingsRaw =
    st.numberOfEmbeddings ?? st.number_of_embeddings;

  const numberOfEmbeddedDocuments =
    typeof numberOfEmbeddedDocumentsRaw === "number"
      ? numberOfEmbeddedDocumentsRaw
      : null;

  const numberOfEmbeddings =
    typeof numberOfEmbeddingsRaw === "number"
      ? numberOfEmbeddingsRaw
      : null;

  return {
    numberOfDocuments:
      typeof st.numberOfDocuments === "number"
        ? st.numberOfDocuments
        : undefined,
    isIndexing: Boolean(st.isIndexing),
    fieldDistribution,
    fieldCount: Object.keys(fieldDistribution).length,
    rawDocumentDbSize:
      typeof st.rawDocumentDbSize === "number"
        ? st.rawDocumentDbSize
        : typeof st.raw_document_db_size === "number"
          ? st.raw_document_db_size
          : undefined,
    avgDocumentSize:
      typeof st.avgDocumentSize === "number"
        ? st.avgDocumentSize
        : typeof st.avg_document_size === "number"
          ? st.avg_document_size
          : undefined,
    numberOfEmbeddedDocuments,
    numberOfEmbeddings,
  };
}
