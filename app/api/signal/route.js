import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// ESP32 calls GET /api/signal?person_id=xxx every 4 seconds
// If caretaker sent a message, return it and mark as delivered
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const person_id = searchParams.get('person_id')

    if (!person_id) {
      return NextResponse.json({ signal: null, error: 'Missing person_id' })
    }

    // Fetch oldest undelivered signal for this person
    const { data, error } = await supabaseServer
      .from('caretaker_signals')
      .select('id, message, signal_type')
      .eq('person_id', person_id)
      .eq('delivered', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()   // returns null instead of error when no rows

    if (error) {
      console.error('Signal fetch error:', error)
      return NextResponse.json({ signal: null })
    }

    if (!data) {
      // No pending signal
      return NextResponse.json({ signal: null })
    }

    // Mark as delivered so ESP32 doesn't repeat it
    await supabaseServer
      .from('caretaker_signals')
      .update({ delivered: true })
      .eq('id', data.id)

    console.log(`Signal delivered to ${person_id}: "${data.message}"`)

    return NextResponse.json({
      signal:      data.message,
      signal_type: data.signal_type,
    })

  } catch (err) {
    console.error('Signal route error:', err)
    return NextResponse.json({ signal: null })
  }
}

export async function GET_status() {
  return NextResponse.json({ status: 'Signal API online' })
}
