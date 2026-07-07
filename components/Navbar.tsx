import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/buzim-grb.png"
            alt="Grb Bužima"
            width={40}
            height={45}
            priority
          />
          <span className="font-semibold text-lg tracking-wide" style={{ color: '#1a3785' }}>
            Posjeti Bužim
          </span>
        </Link>
      </div>
    </nav>
  )
}
