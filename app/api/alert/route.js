import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    const body = await request.json()
    const { person_id, severity } = body

    if (!person_id) {
      return NextResponse.json(
        { error: 'Missing required field: person_id' },
        { status: 400 }
      )
    }

    // Get the person's last known location to attach to the alert
    const { data: lastLocation } = await supabaseServer
      .from('locations')
      .select('lat, lng')
      .eq('person_id', person_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Insert alert into Supabase
    // Supabase Realtime will broadcast this INSERT to the dashboard instantly
    const { data: alert, error } = await supabaseServer
      .from('alerts')
      .insert({
        person_id,
        type:     'emergency',
        status:   'active',
        severity: severity || null,   // null if not yet known (single-button flow)
        message:  'SOS button pressed',
        lat:      lastLocation?.lat || null,
        lng:      lastLocation?.lng || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase alert insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Alert created: ${alert.id} — severity: ${severity || 'unknown'}`)

    return NextResponse.json({
      success:  true,
      alert_id: alert.id,
    }, { status: 201 })

  } catch (err) {
    console.error('Alert route error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Update severity — called when person presses second button to clarify
export async function PATCH(request) {
  try {
    const { alert_id, severity } = await request.json()

    if (!alert_id || !severity) {
      return NextResponse.json(
        { error: 'Missing alert_id or severity' },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from('alerts')
      .update({ severity })
      .eq('id', alert_id)
      .eq('status', 'active') // only update active alerts

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Alert API online' })
}
