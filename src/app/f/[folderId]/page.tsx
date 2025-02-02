import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import {
  files as filesSchema,
  folders as foldersSchema,
} from '~/server/db/schema'
import DriveContents from '~/app/drive-contents'

async function getBreadcrumbs(folderId: number) {
  const parents = []
  let currentId: number | null = folderId
  while (currentId !== null && currentId !== 0) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, currentId))
    console.log(currentId, folder)
    if (!folder[0]) {
      throw new Error('Folder not found')
    }

    parents.unshift(folder[0])
    currentId = folder[0]?.parent ?? null
  }
  return parents
}

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await props.params

  const parsedFolderId = parseInt(folderId)
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }

  const filesPromise = db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parent, parsedFolderId))

  const foldersPromise = db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, parsedFolderId))

  const breadcrumbsPromise = getBreadcrumbs(parsedFolderId)

  const [files, folders, breadcrumbs] = await Promise.all([
    filesPromise,
    foldersPromise,
    breadcrumbsPromise,
  ])

  return (
    <DriveContents files={files} folders={folders} breadcrumbs={breadcrumbs} />
  )
}
