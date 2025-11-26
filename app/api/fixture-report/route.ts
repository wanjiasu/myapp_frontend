
import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  user: process.env.FIXTURE_POSTGRES_USER,
  host: process.env.FIXTURE_POSTGRES_HOST,
  database: process.env.FIXTURE_POSTGRES_DB,
  password: process.env.FIXTURE_POSTGRES_PASSWORD,
  port: parseInt(process.env.FIXTURE_POSTGRES_PORT || '5432'),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get('fixture_id');

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixture_id is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT report_md FROM ai_eval WHERE fixture_id = $1', [fixtureId]);
    if (result.rows.length > 0) {
      return NextResponse.json({ report: result.rows[0].report_md });
    }
    return NextResponse.json({ report: null });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
