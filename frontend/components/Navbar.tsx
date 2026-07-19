'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Leaf } from 'lucide-react';
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'The Villa',
    path: '/villa'
  },
  {
    name: 'Experiences',
    path: '/experiences'
  },
  {
    name: 'Dashboard',
    path: '/admin'
  }];

  const bgColor = isHome ?
  isScrolled ?
  'bg-jungle-dark/95 backdrop-blur-md shadow-soft' :
  'bg-transparent' :
  'bg-jungle-dark shadow-soft';
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${bgColor}`}>
      <div className="px-6 lg:px-14">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-sand-light hover:text-sage transition-colors">

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
              className={`text-sm font-medium tracking-wide transition-colors ${pathname === link.path ? 'text-sage' : 'text-sand-light hover:text-sage'}`}>

                {link.name}
              </Link>
            )}
            <Link
              href="/book"
              className="bg-sage hover:bg-sage-light text-jungle-dark px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5">

              Book Stay
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-sand-light hover:text-sage focus:outline-none">

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
      <div className="md:hidden bg-jungle-dark border-t border-jungle/30">
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
            <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 mt-4 text-center rounded-md text-base font-medium bg-sage text-jungle-dark hover:bg-sage-light">

              Book Stay
            </Link>
          </div>
        </div>
      }
    </nav>);

}
