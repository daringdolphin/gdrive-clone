'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { DELETE_MUTATIONS, QUERIES } from '~/server/db/queries'
import { utapi } from '~/server/uploadthing'

interface FileToDelete {
  id: number
  url: string
  ownerId: string
}

interface FolderToDelete {
  id: number
  ownerId: string
}

function getFileKeyFromUrl(url: string): string {
  const parts = url.split('/')
  const key = parts.at(-1)
  if (!key) throw new Error('Invalid file URL')
  return key
}

async function collectItemsToDelete(
  folderId: number,
  userId: string
): Promise<{
  files: FileToDelete[]
  folders: FolderToDelete[]
}> {
  const filesToDelete: FileToDelete[] = []
  const foldersToDelete: FolderToDelete[] = []

  async function traverse(currentFolderId: number) {
    const [childFiles, childFolders] = await Promise.all([
      QUERIES.getFiles(currentFolderId),
      QUERIES.getFolders(currentFolderId),
    ])

    // Add files to deletion list
    filesToDelete.push(
      ...childFiles.map((file) => ({
        id: file.id,
        url: file.url,
        ownerId: file.ownerId,
      }))
    )

    // Add current folder to deletion list
    const folder = await QUERIES.getFolderById(currentFolderId)
    if (folder.ownerId === userId) {
      foldersToDelete.push({
        id: folder.id,
        ownerId: folder.ownerId,
      })
    }

    // Recursively process child folders
    for (const folder of childFolders) {
      await traverse(folder.id)
    }
  }

  await traverse(folderId)
  return { files: filesToDelete, folders: foldersToDelete }
}

async function deleteFile(fileId: number, userId: string) {
  const file = await QUERIES.getFileById(fileId)
  const fileKey = getFileKeyFromUrl(file.url)
  try {
    await utapi.deleteFiles(fileKey)
  } catch (err) {
    console.error('Error deleting file from Uploadthing:', err)
  }
  try {
    await DELETE_MUTATIONS.deleteFile(fileId, userId)
  } catch (err) {
    console.error('Error deleting file from database:', err)
  }
}

async function performBatchDeletion(
  files: FileToDelete[],
  folders: FolderToDelete[],
  userId: string
) {
  try {
    // Delete files from both Uploadthing and database in parallel
    if (files.length > 0) {
      const fileKeys = files.map((file) => getFileKeyFromUrl(file.url))
      const fileIds = files.map((file) => file.id)

      await Promise.all([
        utapi.deleteFiles(fileKeys),
        DELETE_MUTATIONS.deleteFiles(fileIds, userId),
      ])
    }

    // Then delete all folders in batch
    if (folders.length > 0) {
      const folderIds = folders.map((folder) => folder.id)
      await DELETE_MUTATIONS.deleteFolders(folderIds, userId)
    }
  } catch (err) {
    console.error('Error performing batch deletion:', err)
    throw err
  }
}

export async function deleteItemAction(
  id: number,
  type: 'file' | 'folder',
  currentFolderId: number
) {
  try {
    const user = await auth()
    if (!user?.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (type === 'file') {
      await deleteFile(id, user.userId)
    } else if (type === 'folder') {
      const itemsToDelete = await collectItemsToDelete(id, user.userId)
      await performBatchDeletion(
        itemsToDelete.files,
        itemsToDelete.folders,
        user.userId
      )
    } else {
      return { success: false, error: 'Invalid type' }
    }

    // Revalidate the current folder path
    revalidatePath(`/f/${currentFolderId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item',
    }
  }
}
