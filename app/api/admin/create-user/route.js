import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses service role to create auth users (only works server-side)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      // Caretaker fields
      caretaker_name,
      caretaker_email,
      caretaker_password,
      caretaker_phone,
      // Person (visually impaired) fields
      person_name,
      person_phone,
      device_id,
    } = body

    if (!caretaker_name || !caretaker_email || !caretaker_password || !person_name) {
      return NextResponse.json(
        { error: 'Missing required fields: caretaker_name, caretaker_email, caretaker_password, person_name' },
        { status: 400 }
      )
    }

    // ── Step 1: Create Supabase Auth user for caretaker ──────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email:          caretaker_email,
      password:       caretaker_password,
      email_confirm:  true,   // skip email verification for admin-created users
    })

    if (authError) {
      console.error('Auth create error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const caretakerId = authData.user.id

    // ── Step 2: Insert caretaker profile ─────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id:        caretakerId,
        full_name: caretaker_name,
        role:      'caretaker',
        phone:     caretaker_phone || null,
      })

    if (profileError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(caretakerId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // ── Step 3: Insert person linked to caretaker ─────────────────
    const { data: personData, error: personError } = await supabaseAdmin
      .from('persons')
      .insert({
        name:         person_name,
        caretaker_id: caretakerId,
        device_id:    device_id || null,
        phone:        person_phone || null,
        is_active:    true,
        battery_level: 100,
      })
      .select()
      .single()

    if (personError) {
      // Rollback both
      await supabaseAdmin.from('profiles').delete().eq('id', caretakerId)
      await supabaseAdmin.auth.admin.deleteUser(caretakerId)
      return NextResponse.json({ error: personError.message }, { status: 500 })
    }

    return NextResponse.json({
      success:      true,
      caretaker_id: caretakerId,
      person_id:    personData.id,
      message:      `Caretaker "${caretaker_name}" and person "${person_name}" created and linked.`,
    }, { status: 201 })

  } catch (err) {
    console.error('Create user error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
