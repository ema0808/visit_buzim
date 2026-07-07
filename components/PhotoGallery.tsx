'use client'

import { useState } from 'react'

type Props = {
  urls: string[]
  houseName: string
}

export default function PhotoGallery({ urls, houseName }: Props) {
  const [active, setActive] = useState(0)

  if (urls.length === 0) return null

  return (
    <div className="mt-6">
      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[active]}
        alt={`${houseName} – slika ${active + 1}`}
        className="w-full rounded-2xl object-cover aspect-video bg-gray-100"
      />

      {/* Thumbnails — only show when there are multiple photos */}
      {urls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                i === active ? 'border-[#c8922a]' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${houseName} – slika ${i + 1}`}
                className="w-24 h-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
