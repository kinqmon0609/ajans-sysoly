"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type ImageGalleryProps = {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={images[selectedImage] || "/placeholder.svg"}
          alt={`${title} - Görsel ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg bg-muted transition-all",
                selectedImage === index ? "ring-2 ring-accent ring-offset-2" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
