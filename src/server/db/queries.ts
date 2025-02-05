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

  getFolderById: async function getFolderById(folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId))
    if (!folder[0]) {
      throw new Error('Folder not found')
    }
    return folder[0]
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

export const MUTATIONS = {
  createFile: async function createFile(input: {
    file: {
      name: string
      size: number
      url: string
      parent: number
      type: string
    }
    userId: string
  }) {
    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    })
  },
}
