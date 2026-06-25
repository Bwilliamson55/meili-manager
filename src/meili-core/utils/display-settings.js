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
});

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
  if ((displaySettings.listFields || []).length > 0) return false;
  return isWildcardAttributes(indexSettings.displayedAttributes);
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
  if ((displaySettings.listFields || []).length > 0) {
    return "Custom field list";
  }
  if (isWildcardAttributes(indexSettings.displayedAttributes)) {
    return "All document fields (displayedAttributes: *)";
  }
  const displayed = indexSettings.displayedAttributes;
  if (Array.isArray(displayed) && displayed.length > 0) {
    return "Index displayedAttributes";
  }
  return "First 8 index fields (fallback)";
};
