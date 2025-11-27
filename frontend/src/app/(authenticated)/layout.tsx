'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Map, Users, LogOut, FileText, Printer, UserPlus } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { InviteModal } from '@/components/InviteModal'
import { useState } from 'react'

const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Beneficiários',
    href: '/beneficiarios',
    icon: Users
  },
  {
    label: 'Itens',
    href: '/itens',
    icon: Package
  },
  {
    label: 'Modelos',
    href: '/modelos',
    icon: FileText
  },
  {
    label: 'Rotas',
    href: '/rotas',
    icon: Map
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: Printer
  }
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="grid min-h-screen grid-cols-[280px,1fr]">
        <aside className="border-r border-border bg-[#016a34] flex flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.jpg" 
                alt="Encantar" 
                width={40} 
                height={40} 
                className="object-contain w-auto h-auto"
              />
              <span className="text-xl font-semibold text-white">Encantar</span>
            </div>
          </div>

          <nav className="space-y-0.5 p-6 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={'flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-white/10 ' + 
                    (isActive ? 'bg-white/10' : '')}
                >
                  <item.icon className="h-5 w-5" title={item.label} aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Área do usuário - agora dentro do flex normal */}
          <div className="p-6 border-t border-white/10">
            <div className="text-white text-sm mb-3 flex items-center justify-between">
              <span>Olá, {user?.nome || 'Usuário'}</span>
              <Button
                onClick={() => setInviteModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 px-2 py-1 border border-white/20"
                title="Convidar usuário"
              >
                <UserPlus className="h-4 w-4" title="Enviar convite" aria-hidden="true" />
                <span className="ml-1 text-xs">Convite</span>
              </Button>
            </div>
            <Button 
              onClick={logout}
              variant="ghost" 
              size="sm"
              className="w-full justify-start text-white hover:bg-white/10"
              title="Sair da conta"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4 mr-2" title="Sair" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </aside>

        <main className="p-8">
          {children}
        </main>

        <InviteModal 
          isOpen={inviteModalOpen} 
          onClose={() => setInviteModalOpen(false)} 
        />
      </div>
    </ProtectedRoute>
  )
}
