import { html, nothing, type TemplateResult } from 'lit';
import type { VisualBlockContentDto } from './dto/visual-block-content.dto';

type StyleMap = Record<string, string | number>;

const isImageUrl = (value: string): boolean =>
  value.startsWith('http') || value.startsWith('data:image');

const normalizeBackgroundImage = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'none') {
    return null;
  }
  return trimmed;
};

const extractBackgroundImageUrl = (backgroundImage: string): string | null => {
  if (backgroundImage.includes('url(')) {
    return backgroundImage.slice(4, -1).replace(/['"]/g, '').trim() || null;
  }
  return backgroundImage;
};

export const normalizeStyleMap = (styler?: Record<string, unknown>): StyleMap => {
  if (!styler) {
    return {};
  }
  return Object.entries(styler).reduce<StyleMap>((acc, [key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const resolveBackgroundImage = (styler?: Record<string, unknown>): string | null => {
  if (!styler) {
    return null;
  }
  return normalizeBackgroundImage(styler.backgroundImage);
};

export const resolveImageUrl = (content: VisualBlockContentDto): string | null => {
  const backgroundImage = resolveBackgroundImage(content.styler as Record<string, unknown> | undefined);
  if (backgroundImage) {
    const resolved = extractBackgroundImageUrl(backgroundImage);
    if (resolved) {
      return resolved;
    }
  }

  const contentValue = content.ui?.content;
  if (typeof contentValue === 'string' && isImageUrl(contentValue)) {
    return contentValue;
  }

  return null;
};

export const renderContentText = (text: string): TemplateResult => {
  const lines = text.split('\n');
  return html`${lines.map((line, index) =>
    html`${line}${index < lines.length - 1 ? html`<br />` : nothing}`
  )}`;
};

export const renderVisualBlockContent = (
  content: VisualBlockContentDto,
  hasBackgroundImage: boolean,
): TemplateResult | typeof nothing => {
  const imageUrl = resolveImageUrl(content);
  if (content.type === 'image' && imageUrl && !hasBackgroundImage) {
    return html`<img src=${imageUrl} style="width: 100%; height: 100%; object-fit: cover;" />`;
  }

  const contentValue = content.ui?.content;
  if (typeof contentValue === 'string' && contentValue.trim() !== '' && !isImageUrl(contentValue)) {
    return renderContentText(contentValue);
  }

  return nothing;
};
