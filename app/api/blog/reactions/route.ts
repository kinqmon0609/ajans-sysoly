import { NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET() {
  try {
    // Get all reactions grouped by blog post
    const [rows] = await pool.execute(`
      SELECT 
        bp.id,
        bp.title,
        bp.slug,
        COUNT(CASE WHEN br.reaction_type = 'like' THEN 1 END) as like_count,
        COUNT(CASE WHEN br.reaction_type = 'love' THEN 1 END) as love_count,
        COUNT(CASE WHEN br.reaction_type = 'share' THEN 1 END) as share_count,
        COUNT(br.id) as total_reactions
      FROM blog_posts bp
      LEFT JOIN blog_reactions br ON bp.id = br.blog_post_id
      GROUP BY bp.id, bp.title, bp.slug
      ORDER BY total_reactions DESC
    `);

    return NextResponse.json({ reactions: rows });
  } catch (error) {
    console.error("Reactions yükleme hatası:", error);
    return NextResponse.json(
      { error: "Reactions yüklenemedi" },
      { status: 500 }
    );
  }
}

