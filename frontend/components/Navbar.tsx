'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ProfileMenu } from '@/components/ProfileMenu';
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Track scroll position so the bar can go transparent at the very top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Routes with a hero behind the nav can show a transparent bar — but only
  // while at the top with the menu closed.
  const atTop = !scrolled && !mobileMenuOpen;
  const isHome = pathname === '/';
  const isRoomDetails = pathname.startsWith('/room/');
  const isCheckout = pathname.startsWith('/checkout');
  const isLogin = pathname === '/login';
  const isSignup = pathname === '/signup';
  const isHotel = pathname === '/hotel';
  const isExperiences = pathname === '/experiences';
  const isRooms = pathname === '/rooms';
  const transparent =
    atTop &&
    (isHome ||
      isRoomDetails ||
      isCheckout ||
      isLogin ||
      isSignup ||
      isHotel ||
      isExperiences ||
      isRooms);

  // The home hero is dark (light nav text); the room-details, checkout, login,
  // signup, hotel, experiences, and rooms page-tops are light, so their
  // transparent nav needs dark text.
  const darkText =
    transparent &&
    (isRoomDetails ||
      isCheckout ||
      isLogin ||
      isSignup ||
      isHotel ||
      isExperiences ||
      isRooms);

  const logoCls = darkText
    ? 'text-jungle-dark hover:text-jungle'
    : 'text-sand-light hover:text-sage';
  const linkIdleCls = darkText
    ? 'text-jungle-dark hover:text-jungle'
    : 'text-sand-light hover:text-sage';
  const linkActiveCls = darkText ? 'text-jungle' : 'text-sage';

  function handleSignOut() {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  }
  const navLinks = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'The Hotel',
    path: '/hotel'
  },
  {
    name: 'Rooms',
    path: '/rooms'
  },
  {
    name: 'Experiences',
    path: '/experiences'
  }];

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-primary shadow-soft'}`}>
      <div className="mx-auto max-w-7xl px-page-x lg:px-page-x-lg">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center space-x-2 transition-colors ${logoCls}`}>

            <Leaf className="h-6 w-6" />
            <span className="font-serif text-xl font-medium tracking-wide">
              River Nest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
            <Link
              key={link.name}
              href={link.path}
              className={`text-sm font-medium tracking-wide transition-colors ${pathname === link.path ? linkActiveCls : linkIdleCls}`}>

                {link.name}
              </Link>
            )}
            {user ?
            <ProfileMenu firstName={user.firstName} onSignOut={handleSignOut} darkText={darkText} /> :

            <Link
              href="/login"
              className={`text-sm font-medium tracking-wide transition-colors ${pathname === '/login' ? linkActiveCls : linkIdleCls}`}>

                Sign In
              </Link>
            }
            <Link
              href="/#search-stay"
              className="bg-sage hover:bg-sage-light text-jungle-dark px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5">

              Book Stay
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`focus:outline-none transition-colors ${linkIdleCls}`}>

              {mobileMenuOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen &&
      <div className="md:hidden bg-primary border-t border-jungle/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) =>
          <Link
            key={link.name}
            href={link.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.path ? 'text-sage bg-jungle' : 'text-sand-light hover:text-sage hover:bg-jungle/50'}`}>

                {link.name}
              </Link>
          )}
            {user ?
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/dashboard' ? 'text-sage bg-jungle' : 'text-sand-light hover:text-sage hover:bg-jungle/50'}`}>

                  My Bookings
                </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full px-3 py-2 text-left rounded-md text-base font-medium text-sand-light hover:text-sage hover:bg-jungle/50">

                  Sign Out
                </button>
            </> :

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/login' ? 'text-sage bg-jungle' : 'text-sand-light hover:text-sage hover:bg-jungle/50'}`}>

                Sign In
              </Link>
            }
            <Link
            href="/#search-stay"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 mt-4 text-center rounded-md text-base font-medium bg-sage text-jungle-dark hover:bg-sage-light">

              Book Stay
            </Link>
          </div>
        </div>
      }
    </nav>);

}
