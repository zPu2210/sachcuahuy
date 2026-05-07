"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Menu, X, Book } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface HeaderProps {
  cartCount?: number;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 50);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const nav = mobileNavRef.current;
    const toggle = toggleRef.current;
    const focusables = nav
      ? Array.from(nav.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusables[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !nav) return;
      const items = Array.from(nav.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const insideNav = !!active && nav.contains(active);
      if (e.shiftKey && (active === first || !insideNav)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !insideNav)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      // Only restore focus to toggle when the menu is closed while focus is
      // still inside the trap (Esc, X click, outside-nav click). Skip when a
      // link click navigated away — that would steal focus from the new page.
      const active = document.activeElement as HTMLElement | null;
      if (nav && active && nav.contains(active)) {
        toggle?.focus();
      }
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/sach", label: "Tác Phẩm" },
    { href: "/gioi-thieu", label: "Tác Giả" },
    { href: "/podcast", label: "Podcast" },
  ];

  return (
    <header
      className={clsx(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-paper/85 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50">
            <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Book
                className="w-5 h-5 text-primary group-hover:text-white transition-colors"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-primary leading-none">
                Sách Của Huy
              </span>
              <span className="text-[10px] tracking-widest text-gray-700 uppercase">
                <span lang="en">Writer & Storyteller</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Chính" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={clsx(
                    "group relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                    isActive
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary hover:bg-primary/5",
                  )}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "pointer-events-none absolute left-0 right-0 -bottom-1 h-[2px] bg-accent rounded-full transition-transform duration-300 origin-left",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Cart icon: visual + counter slot ready for future cart context.
                Until a real cart route exists, the action routes to /sach
                and the SR label honestly describes the destination. The
                counter badge is decorative (aria-hidden) at this stage. */}
            <Link
              href="/sach"
              aria-label="Xem sách"
              className="relative inline-flex items-center justify-center w-11 h-11 text-gray-700 hover:text-primary transition-colors hover:bg-primary/5 rounded-full mr-1"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center text-[10px] font-bold leading-none rounded-full bg-accent text-white shadow-sm"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/sach"
              className="hidden md:flex btn btn-primary py-2 px-5 text-sm shadow-md shadow-primary/20 hover:bg-primary-light hover:shadow-lg transition-all"
            >
              Mua Sách
            </Link>

            <button
              ref={toggleRef}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-gray-700 hover:text-primary transition-colors relative z-50"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          id="mobile-nav"
          ref={mobileNavRef}
          aria-hidden={!isMenuOpen}
          className={clsx(
            "fixed inset-0 bg-paper/95 backdrop-blur-xl z-40 md:hidden flex flex-col items-center justify-center transition-opacity duration-200",
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          )}
        >
          <nav aria-label="Di động" className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <div
                key={link.href}
                className={clsx(
                  "transition-all duration-200",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: isMenuOpen ? `${100 + i * 80}ms` : "0ms" }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                  className="font-serif text-3xl font-medium text-primary hover:text-accent-dark transition-colors"
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <div
              className={clsx(
                "transition-all duration-200",
                isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: isMenuOpen ? "340ms" : "0ms" }}
            >
              <Link
                href="/sach"
                onClick={() => setIsMenuOpen(false)}
                tabIndex={isMenuOpen ? 0 : -1}
                className="btn btn-primary mt-4"
              >
                Đến Cửa Hàng
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
