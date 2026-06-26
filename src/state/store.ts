import { create } from 'zustand';
import { produce } from 'immer';
// Fix: Correctly import LayerType as a value and other interfaces as types.
import type { AppState, Layer, GradientLayer, Preset } from './types';
import { LayerType } from './types';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  commit as tlCommit,
  redo as tlRedo,
  undo as tlUndo,
  type TimelineCarrier,
  type TimelineFrame,
} from './timelineSlice';
import { migrateAppState, migrateUserPresets } from '../utils/migrateAppState';

const LOCAL_STORAGE_KEY = 'bggen_v1';
const USER_PRESETS_KEY = 'user_created_presets';
export const USER_PRESETS_UPDATED_EVENT = 'stylescape:user-presets-updated';
const USER_PRESET_LIMIT = 240;

interface TemporalState {
  past: TimelineFrame[];
  present: AppState;
  future: TimelineFrame[];
  undo: () => void;
  redo: () => void;
  addLayer: (type: LayerType) => void;
  removeLayer: (id: string) => void;
  updateLayer: <T extends Layer>(id: string, newProps: Partial<T>) => void;
  selectLayer: (id: string | null) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  updateState: (newState: Partial<AppState>) => void;
  /**
   * Replace the present with a full preset snapshot, committing a
   * single labeled frame.
   */
  loadPreset: (next: AppState, label?: string) => void;
  addUserCreatedPreset: (preset: Preset) => void;
  addUserCreatedPresets: (presets: Preset[]) => void;
  getUserCreatedPresets: () => Preset[];
}

const normalizeUserPresets = (presets: Preset[]): Preset[] => {
  const byId = new Map<string, Preset>();

  presets.forEach((preset) => {
    if (preset?.id) {
      byId.delete(preset.id);
      byId.set(preset.id, preset);
    }
  });

  return Array.from(byId.values()).slice(-USER_PRESET_LIMIT);
};

const getInitialState = (): AppState => {
  try {
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      // Route through the v1→v2 migrator. The migrator is total: on
      // malformed input it returns a default state + sets the
      // `migration:failed` marker for the App banner.
      return migrateAppState(parsed);
    }
  } catch (error) {
    console.error("Error reading from localStorage", error);
  }

  const defaultGradientLayer: GradientLayer = {
    id: `layer-${Date.now()}`,
    name: 'Default Gradient',
    // Fix: Use LayerType enum member directly instead of a string cast.
    type: LayerType.GRADIENT,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    gradientType: 'linear',
    angle: 90,
    stops: [
      { id: 'stop1', color: '#6366F1', offset: 0 },
      { id: 'stop2', color: '#EC4899', offset: 100 },
    ],
  };

  return {
    layers: [defaultGradientLayer],
    canvas: { width: 1280, height: 720, background: '#111827' },
    selectedLayerId: defaultGradientLayer.id,
  };
};

const useStore = create<TemporalState>()(
  subscribeWithSelector((set, _get) => {
    
    // Get user created presets from localStorage
    const getUserCreatedPresets = (): Preset[] => {
      try {
        const item = window.localStorage.getItem(USER_PRESETS_KEY);
        if (!item) return [];
        const parsed = JSON.parse(item);
        // Migrate element-wise so unknown layer types are stripped
        // but the rest of each preset survives (Requirement 12.5).
        return normalizeUserPresets(migrateUserPresets(parsed));
      } catch (error) {
        console.error("Error reading user presets from localStorage", error);
        return [];
      }
    };

    const setUserCreatedPresets = (presets: Preset[]) => {
      try {
        const normalizedPresets = normalizeUserPresets(presets);
        window.localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(normalizedPresets));
        window.dispatchEvent(new CustomEvent(USER_PRESETS_UPDATED_EVENT, { detail: normalizedPresets }));
      } catch (error) {
        console.error("Error saving user presets to localStorage", error);
      }
    };

    const setStateWithHistory = (
      fn: (state: AppState) => AppState,
      label: string = "edit"
    ) => {
      set(produce<TemporalState>(draft => {
          const newPresent = fn(draft.present);
          // Delegates to the unified timeline helpers: coalesces same-label
          // commits within COALESCE_MS, FIFO-evicts at MAX_FRAMES, no-ops
          // when state is structurally unchanged.
          const carrier: TimelineCarrier = {
            past: draft.past,
            present: draft.present,
            future: draft.future,
          };
          tlCommit(carrier, newPresent, label, "command");
          draft.past = carrier.past;
          draft.present = carrier.present;
          draft.future = carrier.future;
      }));
    };

    return {
      past: [],
      present: getInitialState(),
      future: [],
      undo: () => {
        set(produce<TemporalState>(draft => {
          const carrier: TimelineCarrier = {
            past: draft.past,
            present: draft.present,
            future: draft.future,
          };
          tlUndo(carrier);
          draft.past = carrier.past;
          draft.present = carrier.present;
          draft.future = carrier.future;
        }));
      },
      redo: () => {
        set(produce<TemporalState>(draft => {
          const carrier: TimelineCarrier = {
            past: draft.past,
            present: draft.present,
            future: draft.future,
          };
          tlRedo(carrier);
          draft.past = carrier.past;
          draft.present = carrier.present;
          draft.future = carrier.future;
        }));
      },
      addLayer: (type: LayerType) => {
        setStateWithHistory(state => {
          const newId = `layer-${Date.now()}`;
          let newLayer: Layer;
          switch (type) {
            // Fix: Use LayerType enum members in case statements and for object properties.
            case LayerType.GRADIENT:
              newLayer = {
                id: newId, name: 'New Gradient', type: LayerType.GRADIENT, visible: true, opacity: 1, blendMode: 'normal',
                gradientType: 'linear', angle: 90,
                stops: [{ id: 's1', color: '#8B5CF6', offset: 0 }, { id: 's2', color: '#D946EF', offset: 100 }],
              };
              break;
            case LayerType.BLOB:
              newLayer = {
                id: newId, name: 'New Blob', type: LayerType.BLOB, visible: true, opacity: 1, blendMode: 'normal',
                color: '#34D399', seed: Math.random() * 1000, points: 6, chaos: 0.5,
                x: 0.5, y: 0.5, scale: 0.5,
              };
              break;
            case LayerType.WAVE:
                newLayer = {
                    id: newId, name: 'New Wave', type: LayerType.WAVE, visible: true, opacity: 1, blendMode: 'normal',
                    color: '#38bdf8', seed: Math.random() * 1000, points: 10,
                    wavelength: 150, amplitude: 20, y: 0.5,
                    // Fix: Add missing 'angle' property required by WaveLayer interface.
                    angle: 0,
                };
                break;
            case LayerType.PATTERN:
                newLayer = {
                    id: newId, name: 'New Pattern', type: LayerType.PATTERN, visible: true, opacity: 1, blendMode: 'normal',
                    patternType: 'dots', backgroundColor: '#e2e8f0', foregroundColor: '#94a3b8',
                    scale: 20, angle: 0,
                };
                break;
            default:
              return state;
          }
          const newState = produce(state, draft => {
            draft.layers.unshift(newLayer);
            draft.selectedLayerId = newId;
          });
          return newState;
        });
      },
      removeLayer: (id: string) => {
        setStateWithHistory(state => produce(state, draft => {
            draft.layers = draft.layers.filter(layer => layer.id !== id);
            if (draft.selectedLayerId === id) {
                draft.selectedLayerId = draft.layers.length > 0 ? draft.layers[0].id : null;
            }
        }));
      },
      updateLayer: <T extends Layer>(id: string, newProps: Partial<T>) => {
        setStateWithHistory(state => produce(state, draft => {
            const layer = draft.layers.find(l => l.id === id);
            if (layer) {
                Object.assign(layer, newProps);
            }
        }));
      },
      selectLayer: (id: string | null) => {
          set(produce<TemporalState>(draft => {
            draft.present.selectedLayerId = id;
          }));
      },
      reorderLayer: (id: string, direction: 'up' | 'down') => {
        setStateWithHistory(state => produce(state, draft => {
          const index = draft.layers.findIndex(l => l.id === id);
          if (index === -1) return;
          const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(draft.layers.length - 1, index + 1);
          if (newIndex !== index) {
            const [layer] = draft.layers.splice(index, 1);
            draft.layers.splice(newIndex, 0, layer);
          }
        }));
      },
      updateState: (newState: Partial<AppState>) => {
          setStateWithHistory(state => ({ ...state, ...newState }));
      },
      loadPreset: (next: AppState, label: string = "load-preset") => {
        set(produce<TemporalState>(draft => {
          const carrier: TimelineCarrier = {
            past: draft.past,
            present: draft.present,
            future: draft.future,
          };
          tlCommit(carrier, next, label, "snapshot");
          draft.past = carrier.past;
          draft.present = carrier.present;
          draft.future = carrier.future;
        }));
      },
      addUserCreatedPreset: (preset: Preset) => {
        setUserCreatedPresets([...getUserCreatedPresets(), preset]);
      },
      addUserCreatedPresets: (presets: Preset[]) => {
        if (presets.length === 0) return;
        setUserCreatedPresets([...getUserCreatedPresets(), ...presets]);
      },
      getUserCreatedPresets: () => getUserCreatedPresets(),
    };
  })
);

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: number | undefined;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  } as T;
}

const debouncedSave = debounce((state: AppState) => {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
}, 1000);


useStore.subscribe(
  (state) => state.present,
  (presentState) => {
    debouncedSave(presentState);
  }
);

export default useStore;
