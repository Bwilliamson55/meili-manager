const isMetaField = (field) =>
  String(field).startsWith("_") || String(field).startsWith("__");

export const isWildcardAttributes = (attributes) =>
  Array.isArray(attributes) && attributes.includes("*");

const excludeReservedFields = (fields, primaryKey, imageField) =>
  fields.filter(
    (field) =>
      field &&
      field !== primaryKey &&
      field !== imageField &&
      !isMetaField(field),
  );

export const DEFAULT_DISPLAY_SETTINGS = Object.freeze({
  imageField: null,
  listFields: [],
  listColumns: 2,
  listViewMode: "compact",
  compactFieldLimit: 4,
});

export const COMPACT_FIELD_CANDIDATES = [
  "name",
  "title",
  "label",
  "description",
  "type",
  "category",
  "filename",
  "url",
];

export const TITLE_FIELD_CANDIDATES = ["name", "title", "label"];

export const mergeDisplaySettings = (saved = {}) => ({
  ...DEFAULT_DISPLAY_SETTINGS,
  ...saved,
});

export const getDocumentIdFromItem = (item, primaryKey = "") => {
  if (!item) return undefined;
  if (!primaryKey) return item.id;
  const id = item[primaryKey];
  if (id === undefined || id === null) return item.id;
  return id;
};

export const formatDocumentFieldValue = (value, { truncate = 0 } = {}) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (truncate > 0 && text.length > truncate) {
    return `${text.slice(0, truncate)}…`;
  }
  return text;
};

export const getDocumentTitleLabel = (item, primaryKey = "", documentId) => {
  const candidates = [...TITLE_FIELD_CANDIDATES, primaryKey].filter(Boolean);
  for (const field of candidates) {
    if (item?.[field]) return String(item[field]);
  }
  return documentId ?? getDocumentIdFromItem(item, primaryKey) ?? "";
};

export const buildDocumentRoutes = (indexName, documentId) => {
  const id = encodeURIComponent(documentId);
  return {
    edit: `/documents/${indexName}/${id}`,
    similar: `/similar/${indexName}/${id}`,
  };
};

export const resolveTableFields = ({
  items = [],
  resolvedListFields = [],
  primaryKey = "",
  imageField = null,
  useAllItemFields = false,
  limit = 8,
}) => {
  let fields = [...resolvedListFields];
  if (useAllItemFields) {
    const keys = new Set();
    for (const item of items) {
      resolveListFieldsForItem(resolvedListFields, item, {
        useAllItemFields: true,
        primaryKey,
        imageField,
      }).forEach((field) => keys.add(field));
    }
    fields = [...keys];
  }
  const withPk = [
    primaryKey,
    ...fields.filter((field) => field && field !== primaryKey && field !== imageField),
  ].filter(Boolean);
  return [...new Set(withPk)].slice(0, limit);
};

export const resolveFilterableAttributes = (
  indexSettings = {},
  fieldsMetadata = [],
) => {
  const raw = indexSettings.filterableAttributes;
  if (Array.isArray(raw)) {
    const fromSettings = raw.filter((field) => field && field !== "*");
    if (fromSettings.length > 0) return fromSettings;
  }

  if (Array.isArray(fieldsMetadata) && fieldsMetadata.length > 0) {
    return fieldsMetadata
      .filter((row) => row?.filterable === "Yes" || row?.filterable === true)
      .map((row) => row.field || row.name)
      .filter(Boolean);
  }

  return [];
};

export const shouldUseAllItemFields = ({
  displaySettings = {},
  indexSettings = {},
}) => {
  if (displaySettings.listViewMode !== "detailed") return false;
  if ((displaySettings.listFields || []).length > 0) return false;
  return isWildcardAttributes(indexSettings.displayedAttributes);
};

export const resolveCompactPreviewFields = (
  allFields,
  limit = DEFAULT_DISPLAY_SETTINGS.compactFieldLimit,
) => {
  if (!Array.isArray(allFields) || allFields.length === 0) return [];
  const preferred = COMPACT_FIELD_CANDIDATES.filter((field) =>
    allFields.includes(field),
  );
  const rest = allFields.filter((field) => !preferred.includes(field));
  return [...preferred, ...rest].slice(0, limit);
};

export const resolveListFields = ({
  displaySettings = {},
  indexSettings = {},
  primaryKey = "",
  imageField = null,
  fieldDistributionKeys = [],
  itemKeys = [],
}) => {
  const configured = displaySettings.listFields || [];
  if (configured.length > 0) {
    return excludeReservedFields(configured, primaryKey, imageField);
  }

  const displayed = indexSettings.displayedAttributes;
  if (isWildcardAttributes(displayed)) {
    const sourceKeys =
      fieldDistributionKeys.length > 0 ? fieldDistributionKeys : itemKeys;
    return excludeReservedFields(sourceKeys, primaryKey, imageField);
  }

  if (Array.isArray(displayed) && displayed.length > 0) {
    return excludeReservedFields(displayed, primaryKey, imageField);
  }

  const sourceKeys =
    fieldDistributionKeys.length > 0 ? fieldDistributionKeys : itemKeys;
  return excludeReservedFields(sourceKeys, primaryKey, imageField).slice(0, 8);
};

export const resolveListFieldsForItem = (
  resolvedFields,
  item,
  { useAllItemFields = false, primaryKey = "", imageField = null } = {},
) => {
  if (useAllItemFields && item && typeof item === "object") {
    return excludeReservedFields(Object.keys(item), primaryKey, imageField);
  }
  if (!item || typeof item !== "object") return resolvedFields;
  return resolvedFields.filter((field) => Object.hasOwn(item, field));
};

export const getListFieldsSourceLabel = ({
  displaySettings = {},
  indexSettings = {},
}) => {
  const viewHint =
    displaySettings.listViewMode === "table"
      ? " (table view)"
      : displaySettings.listViewMode === "detailed"
        ? " (detailed view)"
        : " (compact preview)";

  if ((displaySettings.listFields || []).length > 0) {
    return `Custom field list${viewHint}`;
  }
  if (isWildcardAttributes(indexSettings.displayedAttributes)) {
    if (displaySettings.listViewMode === "detailed") {
      return `All document fields (displayedAttributes: *)${viewHint}`;
    }
    return `Index field distribution (displayedAttributes: *)${viewHint}`;
  }
  const displayed = indexSettings.displayedAttributes;
  if (Array.isArray(displayed) && displayed.length > 0) {
    return `Index displayedAttributes${viewHint}`;
  }
  return `First 8 index fields (fallback)${viewHint}`;
};
