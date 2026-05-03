"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Book, Search } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { href: "/sach", label: "Tác Phẩm" },
    { href: "/gioi-thieu", label: "Tác Giả" },
    { href: "/podcast", label: "Podcast" },
  ];

  return (
    <motion.header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50">
            <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Book className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-primary leading-none">
                Sách Của Huy
              </span>
              <span className="text-[10px] tracking-widest text-gray-500 uppercase">Writer & Storyteller</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
                    isActive ? "text-primary" : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100/50">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart shortcut → catalog (no real cart MVP) */}
            <Link
              href="/sach"
              aria-label="Xem sách"
              className="relative p-2 text-gray-600 hover:text-primary transition-colors hover:bg-gray-100/50 rounded-full mr-2"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            <Link href="/sach" className="hidden md:flex btn btn-primary py-2 px-5 text-sm shadow-md shadow-primary/20">
              Mua Sách
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors relative z-50"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
          className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 md:hidden flex flex-col items-center justify-center"
        >
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ y: 20, opacity: 0 }}
                animate={isMenuOpen ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-serif text-3xl font-medium text-primary hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isMenuOpen ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/sach" onClick={() => setIsMenuOpen(false)} className="btn btn-primary mt-4">
                Đến Cửa Hàng
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      </div>
    </motion.header>
  );
}
