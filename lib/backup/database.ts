import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function backupDatabase(): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);

    // Create backups directory if it doesn't exist
    try {
      await mkdir(backupDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '8889';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || 'root';
    const dbName = process.env.DB_NAME || 'ajans1_db';

    // Use mysqldump to create backup
    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} > ${filePath}`;
    
    await execAsync(command);

    return {
      success: true,
      filename: filePath
    };

  } catch (error: any) {
    console.error('Database backup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function restoreDatabase(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '8889';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || 'root';
    const dbName = process.env.DB_NAME || 'ajans1_db';

    const command = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} < ${filePath}`;
    
    await execAsync(command);

    return { success: true };

  } catch (error: any) {
    console.error('Database restore error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

