import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const formData = await request.formData()
  const targetId = formData.get('target_id') as string
  const action = formData.get('action') as string

  if (action === 'follow') {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetId,
    })
  } else {
    await supabase.from('follows').delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
  }

  const referer = request.headers.get('referer')
  return NextResponse.redirect(referer || new URL('/', request.url))
}
