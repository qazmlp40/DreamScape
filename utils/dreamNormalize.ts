export const getParamValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" && value.trim() ? value : undefined;
};

export const getParamNumber = (value: unknown) => {
  const rawValue = getParamValue(value);
  if (!rawValue) {
    return undefined;
  }

  const numberValue = Number(rawValue);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const firstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
};

export const getNestedValue = (source: any, paths: string[]) => {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], source);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

export const getNestedText = (source: any, paths: string[]) => {
  return firstText(...paths.map((path) => getNestedValue(source, [path])));
};

export const getDreamListFromResponse = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  }

  const nestedList = getNestedValue(response, [
    "data",
    "dreams",
    "records",
    "items",
    "content",
    "result",
    "results",
    "data.dreams",
    "data.records",
    "data.items",
    "data.content",
    "result.dreams",
    "result.records",
    "result.items",
    "result.content",
  ]);

  return Array.isArray(nestedList) ? nestedList : [];
};

export const extractDreamId = (dream: any) => {
  const dreamId = Number(
    getNestedValue(dream, [
      "dreamId",
      "id",
      "dream_id",
      "dreamID",
      "dream.id",
      "dream.dreamId",
      "record.id",
      "record.dreamId",
    ]),
  );

  return Number.isFinite(dreamId) ? dreamId : undefined;
};

export const extractDreamDate = (dream: any) => {
  const rawDate = firstText(
    getNestedValue(dream, ["date"]),
    getNestedValue(dream, ["dreamDate"]),
    getNestedValue(dream, ["createdAt"]),
    getNestedValue(dream, ["updatedAt"]),
    getNestedValue(dream, ["dream.date"]),
    getNestedValue(dream, ["dream.dreamDate"]),
    getNestedValue(dream, ["record.date"]),
    getNestedValue(dream, ["record.dreamDate"]),
  );

  return rawDate ? rawDate.slice(0, 10) : "";
};

export const extractDreamTitle = (dream: any) => {
  return firstText(
    getNestedValue(dream, ["title"]),
    getNestedValue(dream, ["dreamTitle"]),
    getNestedValue(dream, ["aiTitle"]),
    getNestedValue(dream, ["generatedTitle"]),
    getNestedValue(dream, ["analysis.title"]),
    getNestedValue(dream, ["dreamAnalysis.title"]),
    getNestedValue(dream, ["result.title"]),
    getNestedValue(dream, ["result.dreamTitle"]),
    getNestedValue(dream, ["dream.title"]),
    getNestedValue(dream, ["dream.dreamTitle"]),
    getNestedValue(dream, ["record.title"]),
    getNestedValue(dream, ["record.dreamTitle"]),
  ) ?? "";
};

export const extractDreamText = (dream: any) => {
  return firstText(
    getNestedValue(dream, ["rawText"]),
    getNestedValue(dream, ["content"]),
    getNestedValue(dream, ["dreamText"]),
    getNestedValue(dream, ["text"]),
    getNestedValue(dream, ["dream.rawText"]),
    getNestedValue(dream, ["dream.content"]),
    getNestedValue(dream, ["record.rawText"]),
    getNestedValue(dream, ["record.content"]),
  ) ?? "";
};

export const extractDreamSummary = (dream: any) => {
  return firstText(
    getNestedValue(dream, ["aiSummary"]),
    getNestedValue(dream, ["summary"]),
    getNestedValue(dream, ["analysis.aiSummary"]),
    getNestedValue(dream, ["analysis.summary"]),
    getNestedValue(dream, ["dreamAnalysis.aiSummary"]),
    getNestedValue(dream, ["dreamAnalysis.summary"]),
    getNestedValue(dream, ["result.aiSummary"]),
    getNestedValue(dream, ["result.summary"]),
    getNestedValue(dream, ["dream.aiSummary"]),
    getNestedValue(dream, ["dream.summary"]),
    getNestedValue(dream, ["record.aiSummary"]),
    getNestedValue(dream, ["record.summary"]),
  ) ?? "";
};

export const extractDreamInterpretation = (dream: any) => {
  return firstText(
    getNestedValue(dream, ["aiInterpretation"]),
    getNestedValue(dream, ["interpretation"]),
    getNestedValue(dream, ["analysisText"]),
    getNestedValue(dream, ["analysis.aiInterpretation"]),
    getNestedValue(dream, ["analysis.interpretation"]),
    getNestedValue(dream, ["analysis.analysisText"]),
    getNestedValue(dream, ["dreamAnalysis.aiInterpretation"]),
    getNestedValue(dream, ["dreamAnalysis.interpretation"]),
    getNestedValue(dream, ["result.aiInterpretation"]),
    getNestedValue(dream, ["result.interpretation"]),
    getNestedValue(dream, ["dream.aiInterpretation"]),
    getNestedValue(dream, ["dream.interpretation"]),
    getNestedValue(dream, ["record.aiInterpretation"]),
    getNestedValue(dream, ["record.interpretation"]),
  ) ?? "";
};

export const extractDreamVideoUrl = (dream: any) => {
  return firstText(
    getNestedValue(dream, ["mediaUrl"]),
    getNestedValue(dream, ["videoUrl"]),
    getNestedValue(dream, ["originalMediaUrl"]),
    getNestedValue(dream, ["editedMediaUrl"]),
    getNestedValue(dream, ["video.mediaUrl"]),
    getNestedValue(dream, ["video.videoUrl"]),
    getNestedValue(dream, ["media.mediaUrl"]),
    getNestedValue(dream, ["media.videoUrl"]),
    getNestedValue(dream, ["result.mediaUrl"]),
    getNestedValue(dream, ["result.videoUrl"]),
    getNestedValue(dream, ["dream.mediaUrl"]),
    getNestedValue(dream, ["dream.videoUrl"]),
    getNestedValue(dream, ["record.mediaUrl"]),
    getNestedValue(dream, ["record.videoUrl"]),
  ) ?? "";
};

export const extractDreamTags = (dream: any) => {
  const rawTags = getNestedValue(dream, [
    "tags",
    "tag",
    "keywords",
    "detectedKeywords",
    "analysis.tags",
    "analysis.detectedKeywords",
    "analysis.keywords",
    "dreamAnalysis.tags",
    "dreamAnalysis.keywords",
    "result.tags",
    "result.detectedKeywords",
    "result.keywords",
    "dream.tags",
    "record.tags",
  ]);

  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof rawTags === "string" && rawTags.trim()) {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};
