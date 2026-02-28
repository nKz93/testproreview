"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Send, Star, QrCode, MessageSquare, Settings, CreditCard, X, LogOut
} from 'lucide-react';
import { Star as StarIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/customers', icon: Users, label: 'Clients' },
  { href: '/dashboard/campaigns', icon: Send, label: 'Campagnes' },
  { href: '/dashboard/reviews', icon: Star, label: 'Avis' },
  { href: '/dashboard/qr-codes', icon: QrCode, label: 'QR Codes' },
  { href: '/dashboard/feedbacks', icon: MessageSquare, label: 'Feedbacks prives' },
  { href: '/dashboard/settings', icon: Settings, label: 'Parametres' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Facturation' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
          <StarIcon className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-bold text-xl text-gray-900">ProReview</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
              {item.label}
              {item.href === '/dashboard/feedbacks' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Se deconnecter
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 z-50"
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
