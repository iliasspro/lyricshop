"use client";

import { create } from "zustand";
import { emptyDesign, layerId, type Design, type Layer } from "../design";
import { GARMENTS, type GarmentId, type GarmentView } from "../garments";

export type Panel = "blank" | "text" | "graphics" | "upload" | "ai" | "layers";

type Snapshot = { design: Design; garment: GarmentId; color: string };

type StudioState = {
  designId: string;
  name: string;
  garment: GarmentId;
  color: string;
  view: GarmentView;
  design: Design;
  selectedId: string | null;
  editingText: boolean;
  panel: Panel;
  size: string | null;
  showGuides: boolean;
  past: Snapshot[];
  future: Snapshot[];
  dirty: boolean;
  /** Which Studio URL the current state was initialised from. */
  initKey: string | null;

  setPanel: (p: Panel) => void;
  setName: (n: string) => void;
  setGarment: (g: GarmentId) => void;
  setColor: (c: string) => void;
  setView: (v: GarmentView) => void;
  setSize: (s: string | null) => void;
  toggleGuides: () => void;
  select: (id: string | null) => void;
  setEditingText: (b: boolean) => void;

  /** Push the current state to history; call before a change (or at the start of a gesture). */
  checkpoint: () => void;
  addLayer: (layer: Layer, view?: GarmentView) => void;
  updateLayer: (id: string, patch: Partial<Layer>, opts?: { checkpoint?: boolean }) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayer: (id: string, dir: "up" | "down" | "top" | "bottom") => void;
  clearView: () => void;
  undo: () => void;
  redo: () => void;
  load: (s: { designId?: string; name?: string; garment: GarmentId; color: string; design: Design; view?: GarmentView }) => void;
  markSaved: () => void;
};

const snap = (s: StudioState): Snapshot => ({ design: s.design, garment: s.garment, color: s.color });
const LIMIT = 80;

export const newDesignId = () => layerId("d");

export const useStudio = create<StudioState>()((set, get) => {
  const mutateView = (fn: (layers: Layer[]) => Layer[]) => {
    const { design, view } = get();
    set({ design: { ...design, [view]: fn(design[view]) }, dirty: true });
  };

  return {
    designId: "",
    name: "Untitled design",
    garment: "hoodie",
    color: "black",
    view: "front",
    design: emptyDesign(),
    selectedId: null,
    editingText: false,
    panel: "text",
    size: null,
    showGuides: true,
    past: [],
    future: [],
    dirty: false,
    initKey: null,

    setPanel: (panel) => set({ panel }),
    setName: (name) => set({ name, dirty: true }),
    setGarment: (garment) => {
      if (garment === get().garment) return;
      get().checkpoint();
      const g = GARMENTS[garment];
      const color = g.colors.includes(get().color) ? get().color : g.colors[0];
      const view = g.views[get().view] ? get().view : "front";
      const size = get().size && g.sizes.includes(get().size!) ? get().size : g.sizes.length === 1 ? g.sizes[0] : null;
      set({ garment, color, view, size, dirty: true });
    },
    setColor: (color) => {
      if (color === get().color) return;
      get().checkpoint();
      set({ color, dirty: true });
    },
    setView: (view) => {
      if (!GARMENTS[get().garment].views[view]) return;
      set({ view, selectedId: null });
    },
    setSize: (size) => set({ size }),
    toggleGuides: () => set({ showGuides: !get().showGuides }),
    select: (selectedId) => set({ selectedId, editingText: false }),
    setEditingText: (editingText) => set({ editingText }),

    checkpoint: () => {
      const past = [...get().past, snap(get())].slice(-LIMIT);
      set({ past, future: [] });
    },
    addLayer: (layer, view) => {
      get().checkpoint();
      const v = view ?? get().view;
      const { design } = get();
      set({ design: { ...design, [v]: [...design[v], layer] }, selectedId: layer.id, view: v, dirty: true });
    },
    updateLayer: (id, patch, opts) => {
      if (opts?.checkpoint) get().checkpoint();
      mutateView((layers) => layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)));
    },
    removeLayer: (id) => {
      get().checkpoint();
      mutateView((layers) => layers.filter((l) => l.id !== id));
      if (get().selectedId === id) set({ selectedId: null });
    },
    duplicateLayer: (id) => {
      const layer = get().design[get().view].find((l) => l.id === id);
      if (!layer) return;
      get().checkpoint();
      const copy = { ...layer, id: layerId(layer.type[0]), x: Math.min(0.95, layer.x + 0.04), y: Math.min(0.95, layer.y + 0.04), locked: false };
      mutateView((layers) => {
        const i = layers.findIndex((l) => l.id === id);
        return [...layers.slice(0, i + 1), copy, ...layers.slice(i + 1)];
      });
      set({ selectedId: copy.id });
    },
    moveLayer: (id, dir) => {
      get().checkpoint();
      mutateView((layers) => {
        const i = layers.findIndex((l) => l.id === id);
        if (i < 0) return layers;
        const next = [...layers];
        const [item] = next.splice(i, 1);
        const to = dir === "up" ? Math.min(layers.length - 1, i + 1) : dir === "down" ? Math.max(0, i - 1) : dir === "top" ? layers.length - 1 : 0;
        next.splice(to, 0, item);
        return next;
      });
    },
    clearView: () => {
      get().checkpoint();
      mutateView(() => []);
      set({ selectedId: null });
    },
    undo: () => {
      const { past } = get();
      if (!past.length) return;
      const prev = past[past.length - 1];
      set({ ...prev, past: past.slice(0, -1), future: [snap(get()), ...get().future].slice(0, LIMIT), selectedId: null, dirty: true });
    },
    redo: () => {
      const { future } = get();
      if (!future.length) return;
      const next = future[0];
      set({ ...next, future: future.slice(1), past: [...get().past, snap(get())].slice(-LIMIT), selectedId: null, dirty: true });
    },
    load: ({ designId, name, garment, color, design, view }) => {
      const g = GARMENTS[garment];
      set({
        designId: designId ?? newDesignId(),
        name: name ?? "Untitled design",
        garment,
        color: g.colors.includes(color) ? color : g.colors[0],
        design,
        view: view && g.views[view] ? view : design.front.length || !design.back.length ? "front" : "back",
        selectedId: null,
        size: g.sizes.length === 1 ? g.sizes[0] : null,
        past: [],
        future: [],
        dirty: false,
      });
    },
    markSaved: () => set({ dirty: false }),
  };
});

export const selectedLayer = (s: StudioState): Layer | null =>
  s.selectedId ? s.design[s.view].find((l) => l.id === s.selectedId) ?? null : null;
