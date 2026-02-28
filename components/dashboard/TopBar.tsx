"use client"
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { business, user } = useUser();

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <div className="text-sm font-semibold text-gray-900">{business?.name}</div>
          <div className="text-xs text-gray-400">{user?.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-sm font-bold">
                  {business?.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{business?.name}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/settings">Parametres</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/billing">Facturation</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
