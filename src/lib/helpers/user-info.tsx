import { ExtendedUser } from '@/next-auth'

interface UserInfoProps {
    user?: ExtendedUser
    label: string
}

export const UserInfo: React.FC<UserInfoProps> = ({ user, label }) => {
    return (
        <div>
            <div className="mb-3 text-sm text-neutral-500">{label}</div>
            <div>
                <strong>Email:</strong> {user ? user.email : 'Guest'}
            </div>
            <div className="mt-2">
                <div className="flex justify-between">
                    <strong>ID:</strong> {user ? user.id : 'Guest'}
                </div>
                <div className="flex justify-between">
                    <strong>Name:</strong> {user ? user.name : 'Guest'}
                </div>
                <div className="flex justify-between">
                    <strong>Role:</strong> {user ? user.role : 'Guest'}
                </div>
                <div className="flex justify-between">
                    <strong>Image:</strong>{' '}
                    {user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt={user.name || 'User Image'} />
                    ) : (
                        <span>No Image</span>
                    )}
                </div>
                <div className="flex justify-between">
                    <strong>Two Factor Authentication:</strong>{' '}
                    {user
                        ? user.twoFactorEnabled
                            ? 'Enabled'
                            : 'Disabled'
                        : 'Guest'}
                </div>
            </div>
        </div>
    )
}
