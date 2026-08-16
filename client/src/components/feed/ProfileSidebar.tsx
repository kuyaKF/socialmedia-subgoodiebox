import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { PLAN_LABELS } from '../../config/plans'
import type { GroupRef, PaidSubscriptionPlan, User } from '../../types/models'
import { Avatar } from '../Avatar'
import { RoleBadge } from '../RoleBadge'
import { PencilIcon, UsersIcon } from '../icons'

function memberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function ProfileSidebar({ user, group }: { user: User; group: GroupRef | null }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={20} />
          <div>
            <p className="text-lg font-semibold text-foreground">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Member since {memberSince(user.createdAt)}
        </p>
        <Link
          to={`/profile/${user.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit profile
        </Link>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <UsersIcon className="h-3.5 w-3.5" />
            Your circle
          </p>
          {group ? (
            <>
              <p className="mt-1 text-sm font-semibold text-foreground">{group.name}</p>
              <p className="text-xs text-muted-foreground">
                {group.members.length} member{group.members.length === 1 ? '' : 's'}
              </p>
              <Link
                to="/group"
                className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
              >
                View circle &rarr;
              </Link>
            </>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              You haven't been placed in a circle yet. Once an admin assigns you to one, it'll show
              up here.
            </p>
          )}
        </div>

        {user.role === 'user' && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            {user.subscription.plan === 'free' ? (
              <Link to="/subscription" className="text-xs font-medium text-primary hover:underline">
                Free plan — upgrade to like &amp; comment &rarr;
              </Link>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {PLAN_LABELS[user.subscription.plan as PaidSubscriptionPlan]} plan
                </p>
                <Link
                  to="/subscription"
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Manage subscription
                </Link>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
