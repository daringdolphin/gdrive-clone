import DriveContents from '~/app/drive-contents'
import {
  getFiles,
  getFolders,
  getAllParentsForFolder,
} from '~/server/db/queries'

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await props.params

  const parsedFolderId = parseInt(folderId)
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }

  const [files, folders, breadcrumbs] = await Promise.all([
    getFiles(parsedFolderId),
    getFolders(parsedFolderId),
    getAllParentsForFolder(parsedFolderId),
  ])

  return (
    <DriveContents files={files} folders={folders} breadcrumbs={breadcrumbs} />
  )
}
