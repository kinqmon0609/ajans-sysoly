const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'json');

// Configurations to try
// Removed 'name' from the object passed to connection, added it as a separate property for logging
const configs = [
    { label: 'Socket (root/empty/ajansdb)', config: { socketPath: '/tmp/mysql.sock', user: 'root', password: '', database: 'ajansdb' } },
    { label: 'TCP 3306 (Standard/ajansdb)', config: { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'ajansdb' } },
    { label: 'Socket (root/empty/ajans1)', config: { socketPath: '/tmp/mysql.sock', user: 'root', password: '', database: 'ajans1' } },
    { label: 'TCP 8889 (MAMP/ajans1)', config: { host: '127.0.0.1', port: 8889, user: 'root', password: 'root', database: 'ajans1' } },
];

async function exportTables() {
    console.log('🔄 Attempting to connect to database...');
    let connection;
    let connectedConfigLabel = '';

    for (const { label, config } of configs) {
        try {
            console.log(`   Trying ${label}...`);
            connection = await mysql.createConnection(config);
            console.log(`✅ Connected using ${label}!`);
            connectedConfigLabel = label;
            break;
        } catch (err) {
            console.log(`   ❌ Failed (${label}): ${err.message}`);
        }
    }

    if (!connection) {
        console.error('❌ All connection attempts failed.');
        console.log('   Trying to connect without database to list available databases...');
        try {
            const noDbConfig = { socketPath: '/tmp/mysql.sock', user: 'root', password: '' };
            const conn = await mysql.createConnection(noDbConfig);
            const [dbs] = await conn.query('SHOW DATABASES');
            console.log('   Available databases:');
            dbs.forEach(db => console.log(`   - ${db.Database}`));
            await conn.end();
        } catch (e) {
            console.log('   Could not list databases either.');
        }
        process.exit(1);
    }

    try {
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length === 0) {
            console.log('⚠️ No tables found in database.');
            return;
        }

        console.log(`📦 Found ${tables.length} tables in database. Exporting...`);

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            process.stdout.write(`   - Exporting ${tableName}... `);

            try {
                const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

                const filePath = path.join(OUTPUT_DIR, `${tableName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
                console.log(`Done (${rows.length} rows)`);
            } catch (tableErr) {
                console.log(`Failed: ${tableErr.message}`);
            }
        }

        console.log('✅ Export successfully completed!');
        console.log(`📂 Files saved in: ${OUTPUT_DIR}`);

    } catch (error) {
        console.error('❌ Error during export:', error);
    } finally {
        if (connection) await connection.end();
    }
}

exportTables();
