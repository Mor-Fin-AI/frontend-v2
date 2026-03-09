'use client';

import Image from 'next/image';
import AppMenu from './components/AppMenu';
import Footer from './Footer';
import { sidebarMenu } from './menu';
import { useSidebar } from '@/context/SidebarContext';
import clsx from 'clsx';
import { X } from 'lucide-react';

export default function VerticalNavigationBar() {
  const { open, close } = useSidebar();

  return (
    <>
      {/* OVERLAY (mobile only) */}
      {open && <div onClick={close} className="fixed inset-0 bg-sidebar z-40 lg:hidden" />}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col justify-between ',
          'transform transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0 lg:h-screen'
        )}
      >
        {/* HEADER */}
        <div className="p-6  h-full w-64">
          <div className="flex items-center justify-between mb-10 ">
            <Image
              src="/sidebar/side-logo.png"
              alt="Next"
              width={100}
              height={26}
              className="object-contain h-8 w-40"
            />

            {/* CLOSE BUTTON (mobile only) */}
            <button
              onClick={close}
              className="lg:hidden text-gray-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <AppMenu items={sidebarMenu} />
        </div>

        {/* <Footer /> */}
      </aside>
    </>
  );
}
