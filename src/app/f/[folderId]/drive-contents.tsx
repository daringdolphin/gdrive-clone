'use client'

import { ChevronRight } from 'lucide-react'
import { FileRow, FolderRow } from './file-row'
import type { files_table, folders_table } from '~/server/db/schema'
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { UploadButton } from '~/components/ui/uploadthing'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { useOptimistic } from 'react'
interface DriveState {
  files: (typeof files_table.$inferSelect)[]
  folders: (typeof folders_table.$inferSelect)[]
}

interface DeleteAction {
  type: 'file' | 'folder'
  id: number
}

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[]
  folders: (typeof folders_table.$inferSelect)[]
  breadcrumbs: (typeof folders_table.$inferSelect)[]
  currentFolderId: number
}) {
  const { files, folders, breadcrumbs } = props
  const navigate = useRouter()

  // Optimistic state
  const [optimisticState, addOptimisticState] = useOptimistic<
    DriveState,
    DeleteAction
  >({ files, folders }, (state, action) => ({
    ...state,
    files:
      action.type === 'file'
        ? state.files.filter((f) => f.id !== action.id)
        : state.files,
    folders:
      action.type === 'folder'
        ? state.folders.filter((f) => f.id !== action.id)
        : state.folders,
  }))

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Link
                  href="/f/1"
                  className="text-gray-300 hover:text-white mr-2"
                >
                  My Drive
                </Link>
                {breadcrumbs.map((folder) => (
                  <div key={folder.id} className="flex items-center">
                    <ChevronRight className="mx-2 text-gray-500" size={16} />
                    <Link
                      href={`/f/${folder.id}`}
                      className="text-gray-300 hover:text-white"
                    >
                      {folder.name}
                    </Link>
                  </div>
                ))}
              </div>
              <div>
                <SignedOut>
                  <SignInButton mode="modal">
                    <span className="text-blue-500 underline cursor-pointer">
                      sign in
                    </span>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3">Size</div>
                </div>
              </div>
              <ul className="list-none">
                {optimisticState.folders.map((folder) => (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    currentFolderId={props.currentFolderId}
                    onDelete={() => {
                      addOptimisticState({ type: 'folder', id: folder.id })
                    }}
                  />
                ))}
                {optimisticState.files.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    currentFolderId={props.currentFolderId}
                    onDelete={() => {
                      addOptimisticState({ type: 'file', id: file.id })
                    }}
                  />
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-end">
              <UploadButton
                endpoint="fileUploader"
                input={{
                  folderId: props.currentFolderId,
                }}
                onClientUploadComplete={() => {
                  navigate.refresh()
                }}
                appearance={{
                  button: 'ut-ready:bg-blue-600 p-2',
                  allowedContent: 'hidden',
                }}
                content={{
                  button({ ready }) {
                    if (ready)
                      return (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload Files</span>
                        </div>
                      )
                    return 'Getting ready...'
                  },
                }}
              />
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center h-screen gap-2">
          Please
          <SignInButton mode="modal">
            <span className="text-blue-500 underline cursor-pointer">
              Sign in
            </span>
          </SignInButton>
          to upload files
        </div>
      </SignedOut>
    </>
  )
}
