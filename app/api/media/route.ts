import { NextResponse } from "next/server"

import fs from "fs"
import path from "path"

interface MediaFile {
  name: string
  path: string
  size: number
  sizeFormatted: string
  type: string
  uploadedAt: Date
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
  const videoExts = [".mp4", ".webm", ".mov", ".avi"]
  const docExts = [".pdf", ".doc", ".docx", ".txt"]
  
  if (imageExts.includes(ext)) return "image"
  if (videoExts.includes(ext)) return "video"
  if (docExts.includes(ext)) return "document"
  return "other"
}

// 🚀 Cache (10 dakika) - Media listesi nadiren değişir
const mediaCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 dakika

function getDirectorySize(dirPath: string): number {
  let totalSize = 0
  
  try {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error)
  }
  
  return totalSize
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const cacheKey = `media_${action || 'list'}`
    
    // Cache kontrolü
    const cached = mediaCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }
    
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    // Get storage stats
    if (action === "stats") {
      const totalSize = getDirectorySize(uploadsDir)
      const files = fs.readdirSync(uploadsDir)
      
      const fileTypes = {
        images: 0,
        videos: 0,
        documents: 0,
        others: 0,
      }
      
      files.forEach((file) => {
        const type = getFileType(file)
        if (type === "image") fileTypes.images++
        else if (type === "video") fileTypes.videos++
        else if (type === "document") fileTypes.documents++
        else fileTypes.others++
      })
      
      const responseData = {
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        totalFiles: files.length,
        fileTypes,
      }
      
      // Cache'e kaydet
      mediaCache.set(cacheKey, { data: responseData, timestamp: Date.now() })
      
      return NextResponse.json(responseData)
    }
    
    // Get all media files
    const files = fs.readdirSync(uploadsDir)
    const mediaFiles: MediaFile[] = []
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isFile()) {
        mediaFiles.push({
          name: file,
          path: `/uploads/${file}`,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          type: getFileType(file),
          uploadedAt: stats.mtime,
        })
      }
    }
    
    // Sort by upload date (newest first)
    mediaFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    
    const responseData = { files: mediaFiles }
    
    // Cache'e kaydet
    mediaCache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Media fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch media files" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("file")
    
    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 })
    }
    
    const filePath = path.join(process.cwd(), "public", "uploads", filename)
    
    // Security check - ensure file is in uploads directory
    if (!filePath.startsWith(path.join(process.cwd(), "public", "uploads"))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 })
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      
      // Cache'i temizle (dosya silindi)
      mediaCache.clear()
      
      return NextResponse.json({ success: true, message: "File deleted" })
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Media delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}


