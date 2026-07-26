import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function DELETE(request) {
  try {
    const { user_id, role } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    if (role === 'caretaker') {
      // Unlink persons first (set caretaker_id to null so persons aren't deleted)
      await supabaseAdmin
        .from('persons')
        .update({ caretaker_id: null })
        .eq('caretaker_id', user_id)
    }

    // Delete profile row
    await supabaseAdmin.from('profiles').delete().eq('id', user_id)

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
