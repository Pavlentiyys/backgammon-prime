import { createInitialState } from "@/lib/engine/state";
import type { GameState, Color } from "@/lib/engine/types";

export type Speaker = "ded" | "vnuk";

export type Scene =
  | { kind: "dialogue"; speaker: Speaker; text: string }
  | { kind: "interactive"; state: GameState; bot: "easy" | "medium"; until: "first-roll" | "first-move" | "first-turn" | "game-end" };

export type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  scenes: Scene[];
};

const opening = (color: Color = "white"): GameState => createInitialState(color);

export const CHAPTERS: Chapter[] = [
  {
    id: "intro",
    title: "Глава 1. Чай у деда",
    subtitle: "Знакомство",
    image: "/tutorial/scene-1.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Заходи, внучек! Чайник вскипел. Сегодня будем длинные нарды разбирать.",
      },
      {
        kind: "dialogue",
        speaker: "vnuk",
        text: "Ого, доска большая! А как играют?",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "У каждого 15 фишек на «голове» — это угловой пункт. Двигаемся против часовой стрелки до дома — последних шести пунктов. Кто первый все снимет — тот и победил.",
      },
      {
        kind: "dialogue",
        speaker: "vnuk",
        text: "Звучит просто. Покажешь?",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Конечно. Только сразу запомни три правила:\n\n— с головы за ход можно снять только одну фишку (кроме первого хода с дублем 6-6, 4-4 или 3-3);\n— на пункт с фишкой соперника встать нельзя — фишки тут не бьются;\n— нельзя строить прайм из 6 пунктов, если впереди него нет ни одной фишки соперника.",
      },
    ],
  },

  {
    id: "first-throw",
    title: "Глава 2. Первый бросок",
    subtitle: "Берём кости в руки",
    image: "/tutorial/scene-2.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Бросаем два кубика. Каждое число — сколько пунктов сдвинуть фишку. Можно одной на сумму, можно двумя разными. Дубль играется четыре раза.",
      },
      {
        kind: "dialogue",
        speaker: "vnuk",
        text: "А кто первый ходит?",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Каждый бросает один кубик — у кого больше, тот ходит обоими. Сегодня ты первый. Бери кубики и пробуй.",
      },
    ],
  },

  {
    id: "play",
    title: "Глава 3. Сыграй сам",
    subtitle: "Я подскажу",
    image: "/tutorial/scene-3.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Теперь сам. Я буду подсказывать. Не бойся ошибиться — все на моём веку ошибались. Жми «Бросить кости» и начинаем.",
      },
      {
        kind: "interactive",
        state: opening("white"),
        bot: "easy",
        until: "game-end",
      },
    ],
  },

  {
    id: "wrap-up",
    title: "Глава 4. После партии",
    subtitle: "Что мы узнали",
    image: "/tutorial/scene-4.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Ну вот, первая партия за плечами. Запомни главное: длинные нарды — это не про скорость, а про терпение. Кто умеет ждать удобный бросок и не торопиться с головы — тот и побеждает.",
      },
      {
        kind: "dialogue",
        speaker: "vnuk",
        text: "А что такое марс и кокс?",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Это виды побед. Обычная — соперник успел снять хотя бы одну фишку, 1 очко. Марс — ни одной не снял, 2 очка. Кокс — даже в свой дом не успел все ввести, 3 очка. Стараться надо не просто выиграть, а выиграть «в марс».",
      },
    ],
  },

  {
    id: "block",
    title: "Глава 5. Блок и прайм",
    subtitle: "Тактика",
    image: "/tutorial/scene-5.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Помнишь — на занятый соперником пункт встать нельзя? Используй это. Когда у тебя на пункте две фишки и больше — это «блок». Несколько блоков подряд — это «прайм».",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Длинный прайм запирает фишки соперника надолго. Особенно хорош прайм из 4-5 пунктов в своём доме — пока соперник ждёт удобного броска, ты успеваешь снимать.",
      },
      {
        kind: "dialogue",
        speaker: "vnuk",
        text: "А 6 подряд можно?",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Можно, но только если впереди прайма уже есть фишка соперника. Иначе ты бы запер всё насовсем — а так нечестно.",
      },
    ],
  },

  {
    id: "endgame",
    title: "Глава 6. Финал",
    subtitle: "Иди и побеждай",
    image: "/tutorial/scene-6.png",
    scenes: [
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Когда все 15 фишек у тебя в доме — начинаешь снимать. Кубик «N» снимает фишку с пункта N. Если на пункте N пусто, а есть фишки на пунктах выше — двигай их внутри дома.",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Если бросок больше самого высокого пункта в доме — снимаешь с него.",
      },
      {
        kind: "dialogue",
        speaker: "ded",
        text: "Всё, внучек, ты готов. Иди сыграй с ботом — там посложнее, чем со мной. А вернёшься — ещё чая попьём.",
      },
    ],
  },
];
