'use client'

import type { files_table, folders_table } from '~/server/db/schema'
import { Folder as FolderIcon, FileIcon, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { Button } from '~/components/ui/button'
import { useToast } from '~/hooks/use-toast'
import { ToastAction } from '~/components/ui/toast'
import { useTransition } from 'react'
import { deleteItemAction } from '~/app/actions/delete-item'

export function FileRow(props: {
  file: typeof files_table.$inferSelect
  currentFolderId: number
  onDelete: () => void
}) {
  const { file, currentFolderId, onDelete } = props
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    startTransition(async () => {
      // Optimistically update UI inside transition
      onDelete()

      try {
        const result = await deleteItemAction(file.id, 'file', currentFolderId)
        if (!result.success) {
          throw new Error(result.error)
        }
        toast({
          title: 'File deleted successfully',
          description: `"${file.name}" has been removed from your storage.`,
        })
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to delete item')
        console.error('Error performing batch deletion:', error)
        toast({
          title: 'Failed to delete file',
          description: `An error occurred while deleting "${file.name}". Click to retry.`,
          variant: 'destructive',
          action: (
            <ToastAction altText="Retry deletion" onClick={handleDelete}>
              Retry
            </ToastAction>
          ),
        })
      }
    })
  }

  return (
    <li className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750">
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
        <div className="col-span-2 text-gray-400">{file.size}</div>
        <div className="col-span-1 flex justify-end">
          <ConfirmDialog
            title="Delete File"
            description={`Are you sure you want to delete "${file.name}"? This action cannot be undone.`}
            variant="destructive"
            onConfirm={handleDelete}
            trigger={
              <Button variant="ghost" size="icon" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                )}
              </Button>
            }
          />
        </div>
      </div>
    </li>
  )
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect
  currentFolderId: number
  onDelete: () => void
}) {
  const { folder, currentFolderId, onDelete } = props
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    startTransition(async () => {
      // Optimistically update UI inside transition
      onDelete()

      try {
        const result = await deleteItemAction(
          folder.id,
          'folder',
          currentFolderId
        )
        if (!result.success) {
          throw new Error(result.error)
        }
        toast({
          title: 'Folder deleted successfully',
          description: `"${folder.name}" has been removed from your storage.`,
        })
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to delete item')
        console.error('Error performing batch deletion:', error)
        toast({
          title: 'Failed to delete folder',
          description: `An error occurred while deleting "${folder.name}". Click to retry.`,
          variant: 'destructive',
          action: (
            <ToastAction altText="Retry deletion" onClick={handleDelete}>
              Retry
            </ToastAction>
          ),
        })
      }
    })
  }

  return (
    <li className="px-6 py-4 border-b border-gray-700 hover:bg-gray-750">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex items-center text-gray-100 hover:text-blue-400"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-3 text-gray-400">{'folder'}</div>
        <div className="col-span-2 text-gray-400">-</div>
        <div className="col-span-1 flex justify-end">
          <ConfirmDialog
            title="Delete Folder"
            description={`Are you sure you want to delete "${folder.name}" and all its contents? This action cannot be undone.`}
            variant="destructive"
            onConfirm={handleDelete}
            trigger={
              <Button variant="ghost" size="icon" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                )}
              </Button>
            }
          />
        </div>
      </div>
    </li>
  )
}
