import { NextResponse } from "next/server";

import pool from "@/lib/mysql/client";

export async function POST(request: Request) {
  try {
    const results: any = {
      optimized: [],
      analyzed: [],
      errors: []
    };

    // Critical tables to optimize
    const tables = ['demos', 'blog_posts', 'page_views', 'analytics_events', 'notifications', 'menu_items', 'pages'];

    // OPTIMIZE tables (defragment and rebuild indexes)
    for (const table of tables) {
      try {
        await pool.query(`OPTIMIZE TABLE ${table}`);
        results.optimized.push(table);
      } catch (error: any) {
        results.errors.push(`${table}: ${error.message}`);
      }
    }

    // ANALYZE tables (update statistics for query planner)
    const analyzeTables = ['demos', 'blog_posts', 'page_views'];
    for (const table of analyzeTables) {
      try {
        await pool.query(`ANALYZE TABLE ${table}`);
        results.analyzed.push(table);
      } catch (error: any) {
        results.errors.push(`${table} (analyze): ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database optimized! ${results.optimized.length} tables optimized, ${results.analyzed.length} analyzed.`,
      results
    });

  } catch (error: any) {
    console.error("Database optimization error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}



