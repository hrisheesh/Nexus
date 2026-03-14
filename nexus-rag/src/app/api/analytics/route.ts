import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      totalQueries: 0,
      totalTokens: 0,
      avgLatency: 0,
      documents: 0,
      chunks: 0,
      successRate: 0,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
