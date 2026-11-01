import { Activity, Cpu, CircleCheck, Gauge, ShieldCheck, Terminal, Thermometer, Users, Wifi, Zap } from '@lucide/vue'

// Nama ikon yang disimpan di database -> komponen ikon (daftar harus sama dengan IKON di backend)
export const IKON_HALAMAN = {
  thermometer: Thermometer,
  gauge: Gauge,
  zap: Zap,
  'check-circle': CircleCheck,
  cpu: Cpu,
  terminal: Terminal,
  wifi: Wifi,
  'shield-check': ShieldCheck,
  activity: Activity,
  users: Users,
}

export const DAFTAR_IKON = Object.keys(IKON_HALAMAN)