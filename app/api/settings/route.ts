import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")

    let query = "SELECT * FROM settings ORDER BY category, setting_key"
    const params: any[] = []

    if (category) {
      query = "SELECT * FROM settings WHERE category = ? ORDER BY setting_key"
      params.push(category)
    }

    const [settings] = await pool.execute(query, params)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [result] = await pool.execute(`
      INSERT INTO settings (id, setting_key, setting_value, setting_type, category, label, description)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?)
    `, [
      body.setting_key,
      body.setting_value,
      body.setting_type || 'text',
      body.category || 'general',
      body.label,
      body.description || null
    ])

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Setting creation error:", error)
    return NextResponse.json({ error: "Failed to create setting" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body // Array of { setting_key, setting_value }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Updates must be an array" }, { status: 400 })
    }

    // Batch update
    for (const update of updates) {
      await pool.execute(`
        UPDATE settings 
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ?
      `, [update.setting_value, update.setting_key])
    }

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}


