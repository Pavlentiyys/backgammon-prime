export type SkinId = "classic" | "minimal" | "chaikhana" | "baku";

export type Skin = {
  id: SkinId;
  name: string;
  description: string;
  pro: boolean;
  vars: Record<string, string>;
};

export const SKINS: Skin[] = [
  {
    id: "classic",
    name: "Классика",
    description: "Дерево и латунные углы",
    pro: false,
    vars: {
      "--board-bg": "#d8b88a",
      "--board-frame": "#4a2e16",
      "--point-light": "#e8d3a8",
      "--point-dark": "#7a4521",
      "--accent": "#c8973e",
    },
  },
  {
    id: "minimal",
    name: "Минимал",
    description: "Flat-дизайн, монохром",
    pro: false,
    vars: {
      "--board-bg": "#1a1a1a",
      "--board-frame": "#0a0a0a",
      "--point-light": "#2a2a2a",
      "--point-dark": "#3a3a3a",
      "--accent": "#a0a0a0",
    },
  },
  {
    id: "chaikhana",
    name: "Чайхана",
    description: "Восточный орнамент, медь",
    pro: true,
    vars: {
      "--board-bg": "#9a4f1a",
      "--board-frame": "#3a1a08",
      "--point-light": "#c87a3a",
      "--point-dark": "#5a2a10",
      "--accent": "#e8a040",
    },
  },
  {
    id: "baku",
    name: "Бакинский двор",
    description: "Камень и синяя плитка",
    pro: true,
    vars: {
      "--board-bg": "#3a5878",
      "--board-frame": "#1a2a3a",
      "--point-light": "#5a7898",
      "--point-dark": "#1a3858",
      "--accent": "#e8c060",
    },
  },
];

export function getSkin(id: string | null | undefined): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

export const SKIN_STORAGE_KEY = "Backgammon Prime-skin";
