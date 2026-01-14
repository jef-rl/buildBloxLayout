import type { LitElement } from 'lit';
import type { JsonEditorChangeDetail, JsonEditorPathDetail, ValueChangeDetail } from '../../state/event-types';

type AnyObject = Record<string, unknown>;

function clone(obj: AnyObject) {
  return JSON.parse(JSON.stringify(obj));
}

function getDeep(obj: AnyObject, path: (string | number)[]) {
  return path.reduce((acc: any, key) => (acc ? acc[key] : acc), obj);
}

function setDeep(obj: AnyObject, path: (string | number)[], value: unknown) {
  const lastKey = path[path.length - 1];
  const parent = path.slice(0, -1).reduce((acc: any, key) => acc[key], obj);
  parent[lastKey] = value;
}

export function createJsonEditorHandlers(component: LitElement & { data: AnyObject }) {
  const notifyChange = (newData: AnyObject) => {
    component.data = newData;
    component.dispatchEvent(
      new CustomEvent<ValueChangeDetail<AnyObject>>('change', {
        detail: component.data,
        bubbles: true,
        composed: true,
      })
    );
  };

  const handleUpdateValue = (event: CustomEvent<JsonEditorChangeDetail>) => {
    const { path, value } = event.detail;
    const newData = clone(component.data);
    setDeep(newData, path, value);
    notifyChange(newData);
  };

  const handleRenameKey = (event: CustomEvent<JsonEditorChangeDetail>) => {
    const { path, value } = event.detail;
    const oldKey = String(path[path.length - 1]);
    const parentPath = path.slice(0, -1);
    const newData = clone(component.data);
    const parent = parentPath.length === 0 ? newData : getDeep(newData, parentPath);

    if (Array.isArray(parent) || typeof value !== 'string') return;

    parent[value] = parent[oldKey];
    delete parent[oldKey];
    notifyChange(newData);
  };

  const handleDeleteNode = (event: CustomEvent<JsonEditorPathDetail>) => {
    const { path } = event.detail;
    const key = String(path[path.length - 1]);
    const parentPath = path.slice(0, -1);
    const newData = clone(component.data);

    if (path.length === 0) {
      notifyChange({});
      return;
    }

    const parent = getDeep(newData, parentPath);
    if (Array.isArray(parent)) parent.splice(parseInt(key, 10), 1);
    else delete parent[key];

    notifyChange(newData);
  };

  const getDefault = (type: string) => {
    switch (type) {
      case 'string':
        return 'New Value';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return null;
    }
  };

  const handleAddChild = (event: CustomEvent<JsonEditorChangeDetail>) => {
    const { path, type } = event.detail;
    const newData = clone(component.data);
    const target = path.length === 0 ? newData : getDeep(newData, path);

    const defaultValue = getDefault(type ?? '');

    if (Array.isArray(target)) {
      target.push(defaultValue);
    } else {
      let newKey = 'newProp';
      let count = 1;
      while (Object.prototype.hasOwnProperty.call(target, newKey)) {
        newKey = `newProp${count++}`;
      }
      target[newKey] = defaultValue;
    }
    notifyChange(newData);
  };

  const coerce = (value: any, type: string) => {
    const currentType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (currentType === type) return value;

    switch (type) {
      case 'string':
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      case 'number': {
        const n = Number(value);
        return Number.isNaN(n) ? 0 : n;
      }
      case 'boolean':
        return Boolean(value);
      case 'object':
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
          } catch {
            // ignore
          }
        }
        return {};
      case 'array':
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // ignore
          }
        }
        return [value];
      default:
        return null;
    }
  };

  const handleChangeType = (event: CustomEvent<JsonEditorChangeDetail>) => {
    const { path, type } = event.detail;
    const newData = clone(component.data);

    if (path.length === 0) {
      notifyChange(coerce(component.data, type ?? ''));
      return;
    }

    const key = String(path[path.length - 1]);
    const parentPath = path.slice(0, -1);
    const parent = getDeep(newData, parentPath);

    const oldValue = parent[key];
    const newValue = coerce(oldValue, type ?? '');

    parent[key] = newValue;
    notifyChange(newData);
  };

  return {
    handleUpdateValue,
    handleRenameKey,
    handleDeleteNode,
    handleAddChild,
    handleChangeType,
  };
}

export function createJsonTreeNodeHandlers(
  component: LitElement & {
    path: (string | number)[];
    data: unknown;
    addingMode: boolean;
    changingType: boolean;
    collapsed: boolean;
  }
) {
  const dispatch = (name: string, detail: JsonEditorChangeDetail) => {
    component.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  };

  return {
    handleKeyChange: (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newKey = target.value;
      if (newKey) dispatch('rename-key', { path: component.path, value: newKey });
    },
    handleValueUpdate: (event: CustomEvent<ValueChangeDetail<unknown>>) => {
      dispatch('update-value', { path: component.path, value: event.detail });
    },
    startAddChild: (event: Event) => {
      event.stopPropagation();
      component.addingMode = true;
    },
    commitAddChild: (type: string, event: Event) => {
      event.stopPropagation();
      component.addingMode = false;
      component.collapsed = false;
      dispatch('add-child', { path: component.path, type });
    },
    cancelAddChild: (event: Event) => {
      event.stopPropagation();
      component.addingMode = false;
    },
    startChangeType: (event: Event) => {
      event.stopPropagation();
      component.changingType = true;
    },
    commitChangeType: (type: string, event: Event) => {
      event.stopPropagation();
      component.changingType = false;
      dispatch('change-type', { path: component.path, type });
    },
    cancelChangeType: (event: Event) => {
      event.stopPropagation();
      component.changingType = false;
    },
    handleDelete: (event: Event) => {
      event.stopPropagation();
      dispatch('delete-node', { path: component.path });
    },
    toggleCollapse: () => {
      component.collapsed = !component.collapsed;
    },
    dispatch,
  };
}
