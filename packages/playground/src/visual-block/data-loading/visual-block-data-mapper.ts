import type {
  VisualBlockContentDto,
  VisualBlockDataDefinitionDTO,
  VisualBlockLayoutDto,
  VisualBlockRectDto,
} from './visual-block-data-dto';

type UnknownRecord = Record<string, unknown>;

type LayoutEntry = {
  id: string;
  layout: VisualBlockLayoutDto;
  rects: VisualBlockRectDto[];
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const readNumberOrString = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined;

const readStyler = (value: unknown): Record<string, unknown> | undefined => (isRecord(value) ? value : undefined);

const resolveLayoutKeys = (raw: UnknownRecord): string[] => {
  const directKeys = Object.keys(raw).filter((key) => key.startsWith('layout_'));
  if (directKeys.length > 0) {
    return directKeys;
  }
  const layoutsCandidate = raw.layouts;
  if (isRecord(layoutsCandidate)) {
    return Object.keys(layoutsCandidate);
  }
  return [];
};

const resolveLayoutRecord = (raw: UnknownRecord, layoutId: string): UnknownRecord | null => {
  const directLayout = raw[layoutId];
  if (isRecord(directLayout)) {
    return directLayout;
  }
  const layoutsCandidate = raw.layouts;
  if (isRecord(layoutsCandidate)) {
    const nestedLayout = layoutsCandidate[layoutId];
    if (isRecord(nestedLayout)) {
      return nestedLayout;
    }
  }
  return null;
};

const parseRect = (value: unknown, layoutId: string, index: number): VisualBlockRectDto => {
  if (!isRecord(value)) {
    throw new Error(`Visual block layout \"${layoutId}\" has an invalid position at index ${index}.`);
  }
  const positionId = value._positionID;
  const contentId = value._contentID;
  if (!isString(positionId) || !isString(contentId)) {
    throw new Error(`Visual block layout \"${layoutId}\" position ${index} is missing required IDs.`);
  }
  const { x, y, w, h, z } = value;
  if (!isNumber(x) || !isNumber(y) || !isNumber(w) || !isNumber(h)) {
    throw new Error(`Visual block layout \"${layoutId}\" position ${positionId} has invalid geometry.`);
  }
  return {
    _positionID: positionId,
    _contentID: contentId,
    x,
    y,
    w,
    h,
    z: isNumber(z) ? z : undefined,
  };
};

const parseLayoutEntry = (raw: UnknownRecord, layoutId: string): LayoutEntry => {
  const layoutRecord = resolveLayoutRecord(raw, layoutId);
  if (!layoutRecord) {
    throw new Error(`Visual block layout \"${layoutId}\" is missing.`);
  }
  const positions = layoutRecord.positions;
  if (!Array.isArray(positions)) {
    throw new Error(`Visual block layout \"${layoutId}\" is missing positions.`);
  }
  const rects = positions.map((position, index) => parseRect(position, layoutId, index));
  return {
    id: layoutId,
    rects,
    layout: {
      columns: readNumberOrString(layoutRecord.columns),
      maxWidth: readNumberOrString(layoutRecord.maxWidth),
      positions: rects,
      styler: readStyler(layoutRecord.styler),
    },
  };
};

const resolveContent = (raw: UnknownRecord, contentId: string): VisualBlockContentDto => {
  const candidate = raw[contentId];
  if (!isRecord(candidate)) {
    return {
      _contentID: contentId,
    };
  }
  const resolvedId = isString(candidate._contentID) ? candidate._contentID : contentId;
  return {
    ...candidate,
    _contentID: resolvedId,
  };
};

export function mapRawVisualBlockDataToDefinitionDTO(raw: unknown): VisualBlockDataDefinitionDTO {
  if (!isRecord(raw)) {
    throw new Error('Visual block data payload must be an object.');
  }

  const layoutKeys = resolveLayoutKeys(raw);
  if (layoutKeys.length === 0) {
    throw new Error('Visual block data payload is missing layout definitions.');
  }

  const layoutEntries = layoutKeys.map((layoutId) => parseLayoutEntry(raw, layoutId));
  const layouts = layoutEntries.reduce<Record<string, VisualBlockLayoutDto>>((acc, entry) => {
    acc[entry.id] = entry.layout;
    return acc;
  }, {});
  const rects = layoutEntries.reduce<Record<string, VisualBlockRectDto>>((acc, entry) => {
    entry.rects.forEach((rect) => {
      acc[rect._positionID] = rect;
    });
    return acc;
  }, {});

  const contents = layoutEntries.reduce<Record<string, VisualBlockContentDto>>((acc, entry) => {
    entry.rects.forEach((rect) => {
      if (!acc[rect._contentID]) {
        acc[rect._contentID] = resolveContent(raw, rect._contentID);
      }
    });
    return acc;
  }, {});

  const rawActiveLayoutId = raw.activeLayoutId;
  const activeLayoutId = isString(rawActiveLayoutId) && layouts[rawActiveLayoutId]
    ? rawActiveLayoutId
    : layoutEntries[0]?.id ?? null;

  return {
    layouts,
    rects,
    contents,
    activeLayoutId,
  };
}
