import Link from 'next/link'
import Image from 'next/image'

export function Logo({ size = 'default', showImage = true }: { size?: 'small' | 'default' | 'large', showImage?: boolean }) {
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl',
  }

  const imageSizes = {
    small: 32,
    default: 48,
    large: 64,
  }

  return (
    <Link href="/" className="flex items-center gap-3">
      {showImage && (
        <Image
          src="/logo.png"
          alt="FilaJusta"
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="rounded-lg"
        />
      )}
      <div className="flex flex-col leading-none">
        <span className={`font-black ${sizeClasses[size]} text-primary`}>
          FilaJusta
        </span>
        <span className={`font-bold ${sizeClasses[size]} text-foreground`}>
          VidaPlena
        </span>
      </div>
    </Link>
  )
}
