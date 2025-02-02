/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'server-only'
import {
  bigint,
  int,
  text,
  index,
  singlestoreTableCreator,
} from 'drizzle-orm/singlestore-core'

export const createTable = singlestoreTableCreator(
  (name) => `gdrive-clone_${name}`
)

export const files_table = createTable(
  'files_table',
  {
    id: bigint('id', { mode: 'number', unsigned: true })
      .primaryKey()
      .autoincrement(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    url: text('url').notNull(),
    parent: bigint('parent', { mode: 'number', unsigned: true }).notNull(),
    size: int('size').notNull(),
  },
  (tempTable) => {
    return [index('parent_index').on(tempTable.parent)]
  }
)

export const folders_table = createTable(
  'folders_table',
  {
    id: bigint('id', { mode: 'number', unsigned: true })
      .primaryKey()
      .autoincrement(),
    name: text('name').notNull(),
    parent: bigint('parent', { mode: 'number', unsigned: true }).notNull(),
  },
  (tempTable) => {
    return [index('parent_index').on(tempTable.parent)]
  }
)
