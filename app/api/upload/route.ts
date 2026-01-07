import { type NextRequest, NextResponse } from "next/server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Sharp'ı sadece gerekli olduğunda import et
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, using fallback');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
    }

    // Dosya boyutu kontrolü yok - büyük dosyaları otomatik olarak optimize edeceğiz
    console.log(`📦 Upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Sadece resim dosyaları yüklenebilir" }, { status: 400 })
    }

    // Benzersiz dosya adı oluştur (WebP olarak)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}-${randomString}.webp`

    // Public/uploads klasörünü oluştur (yoksa)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Dosyayı işle
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    let finalBuffer = buffer;
    let finalFileName = file.name;
    
    // Sharp varsa optimize et, yoksa orijinal dosyayı kullan
    if (sharp) {
      try {
        // Dosya boyutuna göre dinamik kalite ayarı
        const fileSizeMB = file.size / 1024 / 1024
        let quality = 92
        let maxWidth = 2560
        
        if (fileSizeMB > 15) {
          quality = 85
          maxWidth = 2048
        } else if (fileSizeMB > 8) {
          quality = 88
          maxWidth = 2304
        }
        
        finalBuffer = await sharp(buffer)
          .resize(maxWidth, null, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ 
            quality: quality,
            effort: 4,
            smartSubsample: false,
            nearLossless: false,
          })
          .toBuffer()
        
        finalFileName = fileName; // WebP dosya adı
        console.log(`✅ Sharp ile optimize edildi: ${(finalBuffer.byteLength / 1024).toFixed(2)} KB`)
      } catch (sharpError) {
        console.warn('Sharp optimization failed, using original file:', sharpError);
        finalBuffer = buffer;
        finalFileName = file.name;
      }
    } else {
      console.log('Sharp not available, using original file');
      finalBuffer = buffer;
      finalFileName = file.name;
    }
    
    const filePath = join(uploadsDir, finalFileName)
    await writeFile(filePath, finalBuffer)

    // Public URL oluştur
    const url = `/uploads/${finalFileName}`

    return NextResponse.json({
      url,
      filename: file.name,
      size: finalBuffer.byteLength,
      type: file.type,
      optimized: sharp ? true : false,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 })
  }
}
