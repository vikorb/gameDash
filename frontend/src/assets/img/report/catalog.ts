import type { ModerationReportAttachmentType } from '@/stores/moderation/types'

export type MockReportAssetCatalogItem = {
  key: string
  name: string
  type: ModerationReportAttachmentType
  url: string
  mimeType: string
}

const assetModules = import.meta.glob('./*.{png,jpg,jpeg,webp,svg,pdf,txt,doc,docx}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getFileName(path: string) {
  return path.split('/').pop() ?? path
}

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function getAttachmentType(ext: string): ModerationReportAttachmentType {
  return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) ? 'image' : 'file'
}

function getMimeType(ext: string) {
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    case 'txt':
      return 'text/plain'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    default:
      return 'application/octet-stream'
  }
}

export const mockReportAssetCatalog: MockReportAssetCatalogItem[] = Object.entries(assetModules)
  .map(([path, url]) => {
    const name = getFileName(path)
    const ext = getExtension(name)

    return {
      key: path,
      name,
      type: getAttachmentType(ext),
      url,
      mimeType: getMimeType(ext),
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export const mockReportImageCatalog = mockReportAssetCatalog.filter((item) => item.type === 'image')
export const mockReportFileCatalog = mockReportAssetCatalog.filter((item) => item.type === 'file')
