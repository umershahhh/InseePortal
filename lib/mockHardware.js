// ─────────────────────────────────────────────────────────────────
//  MOCK MODE — set to false when real hardware components are ready
// ─────────────────────────────────────────────────────────────────
export const MOCK_MODE = false

// ── Mock person data (replace with real DB fetch) ──
export const MOCK_PERSON = {
  id: 'mock-person-001',
  name: 'Ahmed Khan',
  caretaker_id: 'mock-caretaker-001',
  device_id: 'CANE-001',
  is_active: true,
  battery_level: 78,
  phone: '+92-300-0000000',
}

// ── Mock caretaker ──
export const MOCK_CARETAKER = {
  id: 'mock-caretaker-001',
  full_name: 'Sara Khan',
  email: 'sara@example.com',
  role: 'caretaker',
}

// ── Base location (Lahore, Pakistan) ──
const BASE_LAT = 31.5204
const BASE_LNG = 74.3587

// ── Simulate GPS movement ──
// Returns a cleanup function. Replace callback with real Supabase subscription.
export function startLocationSimulation(callback) {
  let step = 0
  // Predefined walking path
  const path = Array.from({ length: 100 }, (_, i) => ({
    lat: BASE_LAT + Math.sin(i * 0.15) * 0.002,
    lng: BASE_LNG + (i * 0.0001),
  }))

  const id = setInterval(() => {
    const loc = path[step % path.length]
    callback({
      lat: parseFloat(loc.lat.toFixed(6)),
      lng: parseFloat(loc.lng.toFixed(6)),
      accuracy: 5,
      timestamp: new Date().toISOString(),
    })
    step++
  }, 3000)

  return () => clearInterval(id)
}

// ── Mock alerts ──
export const MOCK_ALERTS = [
  {
    id: 'alert-001',
    person_id: 'mock-person-001',
    type: 'emergency',
    status: 'active',
    severity: null, // null until person responds
    message: 'SOS button pressed',
    lat: BASE_LAT + 0.0012,
    lng: BASE_LNG + 0.0008,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    resolved_at: null,
  },
  {
    id: 'alert-002',
    person_id: 'mock-person-001',
    type: 'emergency',
    status: 'resolved',
    severity: 'minor',
    message: 'SOS button pressed',
    lat: BASE_LAT - 0.001,
    lng: BASE_LNG + 0.002,
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    person_id: 'mock-person-001',
    type: 'emergency',
    status: 'resolved',
    severity: 'major',
    message: 'SOS button pressed',
    lat: BASE_LAT + 0.003,
    lng: BASE_LNG - 0.001,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 2.8 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Mock camera snapshots ──
// In real mode: these are URLs from Supabase Storage
export const MOCK_CAMERA_FRAMES = [
  'https://placehold.co/640x480/1a1a2e/4f8ef7?text=Camera+Feed+1',
  'https://placehold.co/640x480/1a1a2e/06B6D4?text=Camera+Feed+2',
  'https://placehold.co/640x480/1a1a2e/4f8ef7?text=Camera+Feed+3',
]

// Cycle through mock camera frames every 3s
export function startCameraSimulation(callback) {
  let idx = 0
  callback(MOCK_CAMERA_FRAMES[0]) // immediate first frame
  const id = setInterval(() => {
    idx = (idx + 1) % MOCK_CAMERA_FRAMES.length
    callback(MOCK_CAMERA_FRAMES[idx])
  }, 3000)
  return () => clearInterval(id)
}

// ── Simulate alert trigger (e.g. SOS button on UI) ──
export function createMockAlert() {
  return {
    id: `alert-${Date.now()}`,
    person_id: 'mock-person-001',
    type: 'emergency',
    status: 'active',
    severity: null,
    message: 'SOS button pressed',
    lat: BASE_LAT + (Math.random() - 0.5) * 0.003,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.003,
    created_at: new Date().toISOString(),
    resolved_at: null,
  }
}

// ── Signal types caretaker can send to person ──
export const SIGNAL_OPTIONS = [
  { id: 'help_coming',   label: 'Help is coming',    sub: 'Caretaker is on the way' },
  { id: 'are_you_ok',   label: 'Are you okay?',      sub: 'Request status check' },
  { id: 'call_received', label: 'Call received',      sub: 'Alert acknowledged' },
  { id: 'stay_put',     label: 'Stay where you are', sub: 'Wait for assistance' },
]

// ── Mock admin stats ──
export const MOCK_ADMIN_STATS = {
  total_devices: 3,
  active_devices: 2,
  total_caretakers: 3,
  total_persons: 3,
  alerts_today: 4,
  alerts_this_week: 12,
}

// ── Mock admin users ──
export const MOCK_ADMIN_USERS = [
  { id: '1', name: 'Ahmed Khan',   role: 'user',       caretaker: 'Sara Khan',  device: 'CANE-001', status: 'online',  created_at: '2025-01-10' },
  { id: '2', name: 'Bilal Raza',   role: 'user',       caretaker: 'Fatima Raza',device: 'CANE-002', status: 'online',  created_at: '2025-01-14' },
  { id: '3', name: 'Zara Hussain', role: 'user',       caretaker: 'Ali Hussain',device: 'CANE-003', status: 'offline', created_at: '2025-01-18' },
  { id: '4', name: 'Sara Khan',    role: 'caretaker',  caretaker: '—',          device: '—',        status: 'online',  created_at: '2025-01-10' },
  { id: '5', name: 'Fatima Raza',  role: 'caretaker',  caretaker: '—',          device: '—',        status: 'online',  created_at: '2025-01-14' },
  { id: '6', name: 'Ali Hussain',  role: 'caretaker',  caretaker: '—',          device: '—',        status: 'offline', created_at: '2025-01-18' },
]
