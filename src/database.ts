import { createPool, Pool, RowDataPacket, FieldPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool;

// Function to connect to the database
export const connectDB = async (): Promise<Pool> => {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log('Database connected!');
  }
  return pool;
};

// Function to query the database
export const queryDB = async (query: string, params: any[] = []): Promise<{ results: RowDataPacket[]; fields: FieldPacket[]; affectedRows?: number }> => {
  const connection = await pool.getConnection();
  try {
    const [results, fields]: [RowDataPacket[], FieldPacket[]] = await connection.execute(query, params);
 
    // For SELECT queries, just return the results
    if (query.trim().toUpperCase().startsWith("SELECT")) {
      return { results, fields };
    }
 
    // For non-SELECT queries (like INSERT, UPDATE), handle affectedRows properly
    const resultSet = results as any; // Assuming results contains info for non-SELECT queries
    const affectedRows = resultSet?.affectedRows;
 
    return {
      results: results as RowDataPacket[], 
      fields,
      affectedRows // Return affectedRows if present
    };
  } finally {
    connection.release();
  }
};