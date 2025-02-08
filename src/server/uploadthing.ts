import { createUploadthing } from 'uploadthing/next'
import { UTApi } from 'uploadthing/server'

export const f = createUploadthing()
export const utapi = new UTApi()
