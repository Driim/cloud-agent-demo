interface UserAvatarProps {
  readonly name: string
  readonly size?: 'sm' | 'md'
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
} as const

function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full bg-gradient-to-br from-ai-orange to-ai-purple flex items-center justify-center text-white font-medium shrink-0`}
    >
      {initial}
    </div>
  )
}

export default UserAvatar
