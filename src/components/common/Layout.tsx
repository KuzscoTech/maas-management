import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  CpuChipIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Environments', href: '/environments', icon: CubeIcon },
  { name: 'Agents', href: '/agents', icon: CpuChipIcon },
  { name: 'Tasks', href: '/tasks', icon: DocumentTextIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={classNames(
        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        'fixed inset-0 z-40 flex transition-opacity duration-300 ease-in-out lg:hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">MAAS Platform</h1>
            </div>
            <nav className="mt-5 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={classNames(
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-4 h-6 w-6'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">MAAS Platform</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">MAAS Platform</h1>
            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}