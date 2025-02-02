import type { files, folders } from '~/server/db/schema'
import { Folder as FolderIcon, FileIcon } from 'lucide-react'
import Link from 'next/link'

export function FileRow(props: { file: typeof files.$inferSelect }) {
  const { file } = props
  return (
    <div>
      <li
        key={file.id}
        className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6 flex items-center">
            <Link
              href={file.url}
              className="flex items-center text-gray-100 hover:text-blue-400"
              target="_blank"
            >
              <FileIcon className="mr-3" size={20} />
              {file.name}
            </Link>
          </div>
          <div className="col-span-3 text-gray-400">{'file'}</div>
          <div className="col-span-3 text-gray-400">{file.size}</div>
        </div>
      </li>
    </div>
  )
}
export function FolderRow(props: {
  folder: typeof folders.$inferSelect
  handleFolderClick: () => void
}) {
  const { folder, handleFolderClick } = props
  return (
    <div>
      <li
        key={folder.id}
        className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6 flex items-center">
            <button
              onClick={() => handleFolderClick()}
              className="flex items-center text-gray-100 hover:text-blue-400"
            >
              <FolderIcon className="mr-3" size={20} />
              {folder.name}
            </button>
          </div>
          <div className="col-span-3 text-gray-400">--</div>
        </div>
      </li>
    </div>
  )
}
