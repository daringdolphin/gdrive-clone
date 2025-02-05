/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  bigint,
  int,
  text,
  index,
  singlestoreTableCreator,
  timestamp,
} from 'drizzle-orm/singlestore-core'

export const createTable = singlestoreTableCreator(
  (name) => `gdrive_clone_${name}`
)

export const files_table = createTable(
  'files_table',
  {
    id: bigint('id', { mode: 'number', unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text('owner').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    url: text('url').notNull(),
    parent: bigint('parent', { mode: 'number', unsigned: true }).notNull(),
    size: int('size').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (tempTable) => {
    return [
      index('parent_index').on(tempTable.parent),
      index('owner_index').on(tempTable.ownerId),
    ]
  }
)

export type DB_FileType = typeof files_table.$inferSelect

export const folders_table = createTable(
  'folders_table',
  {
    id: bigint('id', { mode: 'number', unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text('owner').notNull(),
    name: text('name').notNull(),
    parent: bigint('parent', { mode: 'number', unsigned: true }).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (tempTable) => {
    return [
      index('parent_index').on(tempTable.parent),
      index('owner_index').on(tempTable.ownerId),
    ]
  }
)

export type DB_FolderType = typeof folders_table.$inferSelect
