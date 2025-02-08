import 'server-only'
import { db } from '~/server/db'
import { eq, desc, and, inArray } from 'drizzle-orm'
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

  getFileById: async function getFileById(fileId: number) {
    const file = await db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.id, fileId))
    if (!file[0]) {
      throw new Error('File not found')
    }
    return file[0]
  },

  getFiles: async function getFiles(folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(desc(filesSchema.created_at))
  },

  getFolders: async function getFolders(folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(desc(foldersSchema.created_at))
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

export const DELETE_MUTATIONS = {
  deleteFile: async function deleteFile(fileId: number, userId: string) {
    const file = await QUERIES.getFileById(fileId)
    if (file.ownerId !== userId) {
      throw new Error('Unauthorized')
    }

    return await db
      .delete(filesSchema)
      .where(and(eq(filesSchema.id, fileId), eq(filesSchema.ownerId, userId)))
  },

  deleteFiles: async function deleteFiles(fileIds: number[], userId: string) {
    return await db.transaction(async (tx) => {
      // Verify ownership of all files first
      const files = await Promise.all(
        fileIds.map((id) => QUERIES.getFileById(id))
      )

      const unauthorizedFiles = files.filter((file) => file.ownerId !== userId)
      if (unauthorizedFiles.length > 0) {
        throw new Error('Unauthorized: Some files do not belong to the user')
      }

      return await tx
        .delete(filesSchema)
        .where(
          and(inArray(filesSchema.id, fileIds), eq(filesSchema.ownerId, userId))
        )
    })
  },

  deleteFolder: async function deleteFolder(folderId: number, userId: string) {
    return await db
      .delete(foldersSchema)
      .where(
        and(eq(foldersSchema.id, folderId), eq(foldersSchema.ownerId, userId))
      )
  },

  deleteFolders: async function deleteFolders(
    folderIds: number[],
    userId: string
  ) {
    return await db
      .delete(foldersSchema)
      .where(
        and(
          inArray(foldersSchema.id, folderIds),
          eq(foldersSchema.ownerId, userId)
        )
      )
  },
}
