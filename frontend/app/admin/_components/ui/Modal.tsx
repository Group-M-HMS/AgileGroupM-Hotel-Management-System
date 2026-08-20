'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1] as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  theme?: 'dark' | 'light';
  width?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  theme = 'dark',
  width = 'max-w-xl',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const dark = theme === 'dark';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="fixed inset-0 cursor-default bg-jungle-dark/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative z-10 w-full ${width} overflow-hidden rounded-2xl border shadow-2xl ${
              dark ? 'border-sand bg-white text-jungle-dark' : 'border-admin-jungle/12 bg-white text-admin-jungle'
            }`}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: EASE }}>

            <header
              className={`flex items-start justify-between gap-6 border-b px-6 py-4 ${
                dark ? 'border-sand' : 'border-admin-jungle/10'
              }`}>

              <div>
                <h2 className={`text-base font-semibold ${dark ? 'text-jungle-dark' : 'text-admin-jungle'}`}>{title}</h2>
                {description && (
                  <p className={`mt-1 text-sm ${dark ? 'text-jungle/60' : 'text-admin-jungle/60'}`}>{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`rounded-lg p-1.5 transition-colors duration-150 ${
                  dark
                    ? 'text-jungle/60 hover:bg-sand hover:text-jungle-dark'
                    : 'text-admin-jungle/50 hover:bg-admin-jungle/5 hover:text-admin-jungle'
                }`}>

                <XIcon className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 thin-scroll">{children}</div>
            {footer && (
              <footer
                className={`flex items-center justify-end gap-3 border-t px-6 py-4 ${
                  dark ? 'border-sand bg-sand-light/40' : 'border-admin-jungle/10 bg-admin-sand/60'
                }`}>

                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
