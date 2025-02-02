import 'server-only'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from '~/server/db/schema'

export const QUERIES = {
  getAllParentsForFolder: async function getAllParentsForFolder(
    folderId: number
  ) {
    const parents = []
    let currentId: number | null = folderId
    while (currentId !== null && currentId !== 0) {
      const folder = await db
        .select()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId))
      if (!folder[0]) {
        throw new Error('Folder not found')
      }

      parents.unshift(folder[0])
      currentId = folder[0]?.parent ?? null
    }
    return parents
  },

  getFiles: async function getFiles(folderId: number) {
    return db.select().from(filesSchema).where(eq(filesSchema.parent, folderId))
  },

  getFolders: async function getFolders(folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
  },
}
