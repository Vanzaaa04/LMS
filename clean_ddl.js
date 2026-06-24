const fs = require('fs');

let sql = fs.readFileSync('database_ddl_utf8.sql', 'utf8');

// Remove BOM if exists
if (sql.charCodeAt(0) === 0xFEFF) {
  sql = sql.slice(1);
}

// Remove CREATE SCHEMA
sql = sql.replace(/CREATE SCHEMA.*?;/gs, '');

// Remove CREATE TYPE
sql = sql.replace(/CREATE TYPE.*?;/gs, '');

// Replace specific types to standard VARCHAR
sql = sql.replace(/"Role"/g, 'VARCHAR(255)');
sql = sql.replace(/"MaterialType"/g, 'VARCHAR(255)');
sql = sql.replace(/JSONB/g, 'VARCHAR(4000)');
sql = sql.replace(/TIMESTAMP\(3\)/g, 'TIMESTAMP');
sql = sql.replace(/TEXT/g, 'VARCHAR(4000)');

// Clean up empty lines at the top
sql = sql.replace(/^\s+/g, '');

fs.writeFileSync('clean_ddl.sql', sql, 'utf8');
console.log('Cleaned DDL created');
