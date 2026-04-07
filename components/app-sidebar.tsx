'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Calculator,
  DollarSign,
  GitMerge,
  Key,
  FileText,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const mainNav = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Data Kos',
    href: '/kos',
    icon: Building2,
  },
  {
    title: 'Kalkulator AHP',
    href: '/ahp',
    icon: Calculator,
  },
  {
    title: 'Kalkulator CBP',
    href: '/cbp',
    icon: DollarSign,
  },
  {
    title: 'Integrasi',
    href: '/integration',
    icon: GitMerge,
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: FileText,
  },
]

const settingsNav = [
  {
    title: 'API Keys',
    href: '/api-keys',
    icon: Key,
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
]

interface AppSidebarProps {
  isCollapsed?: boolean
  onCollapse?: () => void
}

export function AppSidebar({ isCollapsed = false, onCollapse }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-purple-200/50 bg-gradient-to-b from-white to-purple-50/30 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-purple-200/50 px-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-900">DSS Kos</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 text-gray-500 hover:bg-purple-100 hover:text-purple-700"
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', !isCollapsed && 'rotate-180')}
            />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href
              const NavItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-purple-600')} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-900 text-white">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return NavItem
            })}
          </nav>

          <Separator className="my-4 bg-purple-200/50" />

          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href
              const NavItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-purple-600')} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-900 text-white">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return NavItem
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t border-purple-200/50 p-3">
          {!isCollapsed && user && (
            <div className="mb-2 rounded-lg bg-purple-50 px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              'w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Keluar</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
