export type File = {
  id: number
  name: string
  type: 'file'
  url: string
  parent: number
  size: number
}

export type Folder = {
  id: number
  name: string
  type: 'folder'
  parent: number
}

export const mockFolders: Folder[] = [
  { id: 1, name: 'root', type: 'folder', parent: 0 },
  { id: 2, name: 'Documents', type: 'folder', parent: 1 },
  { id: 3, name: 'Images', type: 'folder', parent: 1 },
  { id: 4, name: 'Work', type: 'folder', parent: 1 },
  { id: 5, name: 'Presentations', type: 'folder', parent: 4 },
]

export const mockFiles: File[] = [
  {
    id: 6,
    name: 'Resume.pdf',
    type: 'file',
    url: '/files/resume.pdf',
    parent: 1,
    size: 1200,
  },
  {
    id: 7,
    name: 'Project Proposal.docx',
    type: 'file',
    url: '/files/proposal.docx',
    parent: 2,
    size: 2500,
  },
  {
    id: 8,
    name: 'Vacation.jpg',
    type: 'file',
    url: '/files/vacation.jpg',
    parent: 3,
    size: 3700,
  },
  {
    id: 9,
    name: 'Profile Picture.png',
    type: 'file',
    url: '/files/profile.png',
    parent: 3,
    size: 1800,
  },
  {
    id: 10,
    name: 'Q4 Report.pptx',
    type: 'file',
    url: '/files/q4-report.pptx',
    parent: 5,
    size: 5200,
  },
  {
    id: 11,
    name: 'Budget.xlsx',
    type: 'file',
    url: '/files/budget.xlsx',
    parent: 4,
    size: 1500,
  },
  {
    id: 12,
    name: 'Test.txt',
    type: 'file',
    url: '/files/test.txt',
    parent: 3,
    size: 1500,
  },
]

// Type to represent either a file or folder when needed
export type FileSystemItem = File | Folder
