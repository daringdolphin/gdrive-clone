import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { auth } from '@clerk/nextjs/server'
import { MUTATIONS, QUERIES } from '~/server/db/queries'
import { z } from 'zod'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
      maxFileCount: 5,
    },
  })
    .input(
      z.object({
        folderId: z.number().optional(),
      })
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const user = await auth()
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user?.userId) throw new UploadThingError('Unauthorized')
      const folder = await QUERIES.getFolderById(input.folderId ?? 0)
      if (!folder) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError('Folder not found')
      }

      if (folder.ownerId !== user.userId) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError('Unauthorized')
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, parentId: input.folderId ?? 0 }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId)

      console.log('file url', file.url)
      const fileType = file.name.split('.').pop()
      await MUTATIONS.createFile({
        file: {
          name: file.name,
          size: file.size,
          url: file.url,
          parent: metadata.parentId,
          type: fileType ?? 'file',
        },
        userId: metadata.userId,
      })

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
