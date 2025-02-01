"use client"

import { useState } from "react"
import { File, mockFiles } from "../lib/mock-data"
import { Folder, FileIcon, Upload, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              onClick={() => setCurrentFolder(null)}
              variant="ghost"
              className="text-gray-300 hover:text-white mr-2"
            >
              My Drive
            </Button>
            {getBreadcrumbs().map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-gray-500" size={16} />
                <Button
                  onClick={() => handleFolderClick(folder.id)}
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} className="bg-blue-600 text-white hover:bg-blue-700">
            <Upload className="mr-2" size={20} />
            Upload
          </Button>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3">Size</div>
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Documentation →</h3>
            <div className="text-lg">
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
