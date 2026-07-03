import React from 'react';
import { Leaf, MapPin, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

function Instagram({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function Twitter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.4 5.4 3.9 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}
export function Footer() {
  return (
    <footer className="bg-jungle-dark text-sand pt-16 pb-8">
      <div className="px-6 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center space-x-2 text-sand-light mb-6">

              <Leaf className="h-6 w-6" />
              <span className="font-serif text-xl font-medium tracking-wide">
                River Nest
              </span>
            </Link>
            <p className="text-sm text-sand/80 leading-relaxed mb-6">
              Disconnect from noise. Reconnect with nature. A sustainable
              eco-retreat nestled in the heart of Sri Lanka's lush rainforests.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-sand/80 hover:text-sage transition-colors">

                <Instagram />
              </a>
              <a
                href="#"
                className="text-sand/80 hover:text-sage transition-colors">

                <Facebook />
              </a>
              <a
                href="#"
                className="text-sand/80 hover:text-sage transition-colors">

                <Twitter />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg text-sand-light mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/villa"
                  className="text-sand/80 hover:text-sage transition-colors">

                  The Villa
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Book Your Stay
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-sand-light mb-6">
              Experiences
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/experiences"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Jungle Walk
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="text-sand/80 hover:text-sage transition-colors">

                  River Bathing
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Bird Watching
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="text-sand/80 hover:text-sage transition-colors">

                  Wellness & Yoga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-sand-light mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 text-sand/80">
                <MapPin className="h-5 w-5 text-sage shrink-0" />
                <span>
                  123 Forest Edge Road,
                  <br />
                  Kitulgala, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sand/80">
                <Phone className="h-5 w-5 text-sage shrink-0" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-center space-x-3 text-sand/80">
                <Mail className="h-5 w-5 text-sage shrink-0" />
                <span>hello@rivernest.eco</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-jungle pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-sand/60">
          <p>
            &copy; {new Date().getFullYear()} River Nest Eco Villa. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-sand transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-sand transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>);

}
