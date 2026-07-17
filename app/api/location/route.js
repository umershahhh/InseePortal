import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    const body = await request.json()
    const { person_id, lat, lng, accuracy } = body

    // Basic validation
    if (!person_id || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: person_id, lat, lng' },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Write to Supabase
    const { error } = await supabaseServer
      .from('locations')
      .insert({
        person_id,
        lat:      parseFloat(lat),
        lng:      parseFloat(lng),
        accuracy: accuracy || 5,
      })

    if (error) {
      console.error('Supabase location insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also update battery level if sent
    if (body.battery !== undefined) {
      await supabaseServer
        .from('persons')
        .update({ battery_level: body.battery })
        .eq('id', person_id)
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err) {
    console.error('Location route error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Allow ESP32 to check if route is alive
export async function GET() {
  return NextResponse.json({ status: 'Location API online' })
}
