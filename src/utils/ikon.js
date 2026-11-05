import {
  siInstagram,
  siGithub,
  siDiscord,
  siNpm,
  siIonic,
  siAngular,
  siCapacitor,
  siVercel,
  siLaravel,
  siReact,
  siAdonisjs,
  siPython,
  siFirebase,
  siFigma,
  siJavascript,
  siTypescript,
  siHtml5,
  siPhp,
  siVuedotjs,
  siExpress,
  siSwagger,
  siPostgresql,
  siNeon,
  siMysql,
  siMariadb,
  siDocker,
  siCloudflare,
  siRender,
  siApache,
  siGoogledocs,
  siGooglesheets,
  siGooglecalendar,
  siGoogleforms,
  siClickup,
  siTrello,
  siZoom,
} from 'simple-icons'
import {
  Mail,
  CodeXml,
  GitBranch,
  Zap,
  Map as IkonPeta,
  Activity,
  Code,
  Globe,
  Briefcase,
  LayoutGrid,
} from '@lucide/vue'

const merek = (data) => ({ jenis: 'merek', data })
const lucide = (komponen) => ({ jenis: 'lucide', komponen })

// Kunci -> ikon. Kunci lama tetap dipakai agar cocok dengan data yang sudah tersimpan.
export const IKON = {
  // Kontak pribadi
  email: lucide(Mail),
  instagram: merek(siInstagram),
  linkedin: { jenis: 'linkedin' }, // digambar sendiri di komponen
  github: merek(siGithub),
  discord: merek(siDiscord),
  // Alat dan teknologi
  'code-slash-outline': lucide(CodeXml), // VS Code
  'logo-github': merek(siGithub),
  'logo-npm': merek(siNpm),
  'logo-ionic': merek(siIonic),
  'logo-angular': merek(siAngular),
  'git-branch-outline': lucide(GitBranch),
  'logo-capacitor': merek(siCapacitor),
  'logo-vercel': merek(siVercel),
  'logo-laravel': merek(siLaravel),
  'logo-react': merek(siReact),
  adonis: merek(siAdonisjs),
  'logo-python': merek(siPython),
  'flash-outline': lucide(Zap),
  'logo-firebase': merek(siFirebase),
  'logo-figma': merek(siFigma),
  'map-outline': lucide(IkonPeta),
  'pulse-outline': lucide(Activity),
  'code-outline': lucide(Code), // C#
  javascript: merek(siJavascript),
  typescript: merek(siTypescript),
  html5: merek(siHtml5),
  php: merek(siPhp),
  vue: merek(siVuedotjs),
  express: merek(siExpress),
  'rest-api': merek(siSwagger),
  postgresql: merek(siPostgresql),
  neon: merek(siNeon),
  mysql: merek(siMysql),
  mariadb: merek(siMariadb),
  docker: merek(siDocker),
  cloudflare: merek(siCloudflare),
  render: merek(siRender),
  apache: merek(siApache),
  'google-docs': merek(siGoogledocs),
  'google-sheets': merek(siGooglesheets),
  'google-calendar': merek(siGooglecalendar),
  'google-forms': merek(siGoogleforms),
  clickup: merek(siClickup),
  trello: merek(siTrello),
  zoom: merek(siZoom),
  'ms-office': lucide(Briefcase),
  wbspro: lucide(LayoutGrid),
}

// Kunci cadangan bila ikon tidak dikenali
export const IKON_CADANGAN = lucide(Globe)

// Kunci khusus halaman Administrasi: tidak muncul di pilihan Alat dan Teknologi
export const KUNCI_ADMINISTRASI = [
  'google-docs',
  'google-sheets',
  'google-calendar',
  'google-forms',
  'clickup',
  'trello',
  'zoom',
  'ms-office',
  'wbspro',
]

// Daftar pilihan ikon untuk form admin (hanya ikon tools, bukan kontak dan bukan keterampilan Administrasi)
export const DAFTAR_IKON_TOOL = Object.keys(IKON).filter(
  (k) =>
    !['email', 'instagram', 'linkedin', 'github', 'discord', ...KUNCI_ADMINISTRASI].includes(k),
)

export function cariIkon(nama) {
  return IKON[nama] ?? IKON_CADANGAN
}
