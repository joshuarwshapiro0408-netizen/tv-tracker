import { getShow } from '@/lib/tmdb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const data = await getShow(Number(id))
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Show not found' }, { status: 404 })
  }
}
