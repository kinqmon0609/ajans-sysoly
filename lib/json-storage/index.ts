// JSON Storage ana export dosyası
export { jsonStorage, JsonStorageClient, dbPool } from './client';
export { initializeJsonDatabase, resetJsonDatabase } from './init-data';

// MySQL client'ı JSON storage ile değiştir
export { jsonStorage as default } from './client';
