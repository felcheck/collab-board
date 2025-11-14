// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    boards: i.entity({
      name: i.string(),
      createdAt: i.number().indexed(),
    }),
    stickyNotes: i.entity({
      content: i.string(),
      x: i.number(),
      y: i.number(),
      color: i.string(),
      width: i.number(),
      height: i.number(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
    shapes: i.entity({
      type: i.string(), // rectangle, circle, triangle, line, arrow
      x: i.number(),
      y: i.number(),
      width: i.number(),
      height: i.number(),
      color: i.string(),
      strokeWidth: i.number(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    boardCreator: {
      forward: {
        on: "boards",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "createdBoards",
      },
    },
    stickyNoteBoard: {
      forward: {
        on: "stickyNotes",
        has: "one",
        label: "board",
      },
      reverse: {
        on: "boards",
        has: "many",
        label: "stickyNotes",
      },
    },
    stickyNoteCreator: {
      forward: {
        on: "stickyNotes",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "createdStickyNotes",
      },
    },
    shapeBoard: {
      forward: {
        on: "shapes",
        has: "one",
        label: "board",
      },
      reverse: {
        on: "boards",
        has: "many",
        label: "shapes",
      },
    },
    shapeCreator: {
      forward: {
        on: "shapes",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "createdShapes",
      },
    },
  },
  rooms: {
    board: {
      presence: i.entity({
        name: i.string(),
        color: i.string(),
        cursorX: i.number(),
        cursorY: i.number(),
      }),
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
