'use client'

import { useRef, useState } from 'react'
import { t } from '@/lib/strings'

export default function PhotoUploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setUploading(true)
    await action(formData)
    setFileName(null)
    setUploading(false)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="cursor-pointer">
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <div className="text-center text-sm rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors">
          <span className={fileName ? 'text-gray-700 truncate block' : 'text-gray-400'}>
            {fileName ?? t.owner.noFileChosen}
          </span>
        </div>
      </label>
      <button
        type="submit"
        disabled={!fileName || uploading}
        className="w-full rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#c8922a' }}
      >
        {uploading ? '...' : t.owner.uploadPhoto}
      </button>
    </form>
  )
}
