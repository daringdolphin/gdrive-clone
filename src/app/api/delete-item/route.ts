import { auth } from '@clerk/nextjs/server'
import { DELETE_MUTATIONS, QUERIES } from '~/server/db/queries'
import { utapi } from '~/server/uploadthing'

interface DeleteItemPayload {
  id: number
  type: 'file' | 'folder'
}

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

export async function DELETE(request: Request) {
  try {
    const user = await auth()
    if (!user?.userId) return new Response('Unauthorized', { status: 401 })

    const payload = (await request.json()) as DeleteItemPayload
    if (!payload.id || !payload.type)
      return new Response('Missing id or type', { status: 400 })

    if (payload.type === 'file') {
      await deleteFile(payload.id, user.userId)
    } else if (payload.type === 'folder') {
      const itemsToDelete = await collectItemsToDelete(payload.id, user.userId)
      await performBatchDeletion(
        itemsToDelete.files,
        itemsToDelete.folders,
        user.userId
      )
    } else {
      return new Response('Invalid type', { status: 400 })
    }

    return new Response('Deleted successfully', { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Delete error:', error.message)
    }
    return new Response('Internal Server Error', { status: 500 })
  }
}
