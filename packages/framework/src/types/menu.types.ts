// Menu types

export type FrameworkMenuItemType = 'parent' | 'preset' | 'action';

export interface FrameworkMenuItemBase {
  id: string;
  label: string;
  icon?: string;
  order: number;
}