import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sparkles, Award } from "lucide-react";

interface NavigationProps {
    isScrolled: boolean;
    selectedType?: 'beauty' | 'dental' | null;
}

const Navigation: React.FC<NavigationProps> = ({ isScrolled, selectedType }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    useNavigate();
    const navItems = [
        { name: 'Գլխավոր', path: '/' },
        { name: 'Առանձնահատկություններ', path: '/features' },
        { name: 'Գներ', path: '/pricing' },
        { name: 'Կապ', path: '/contact' }
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const getBusinessType = () => {
        const params = new URLSearchParams(location.search);
        const typeFromUrl = params.get('type');
        if (typeFromUrl) return typeFromUrl;

        // Եթե կա selectedType prop-ից
        if (selectedType) return selectedType;

        // Վերջին ընտրությունը localStorage-ից
        return localStorage.getItem('preferred_business_type') || 'beauty';
    };

    const businessType = getBusinessType();

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${isScrolled
                    ? 'bg-white/80 backdrop-blur-lg shadow-lg py-3'
                    : 'bg-transparent py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                          flex items-center justify-center shadow-lg shadow-[#C5A28A]/20"
                            >
                                <Sparkles size={20} className="text-white" />
                            </motion.div>
                            <span className="text-xl font-light text-[#2C2C2C] group-hover:text-[#C5A28A] transition-colors">
                SmartBook
              </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    relative px-5 py-2 rounded-full text-sm transition-all duration-300
                    ${isActive(item.path)
                                        ? 'text-[#C5A28A] font-medium'
                                        : 'text-[#2C2C2C] hover:text-[#C5A28A]'
                                    }
                  `}
                                >
                                    {isActive(item.path) && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 rounded-full"
                                            transition={{ type: "spring" as const, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to={`/login?type=${businessType}`}
                                className="px-6 py-2.5 text-sm text-[#2C2C2C] hover:text-[#C5A28A] transition-colors"
                            >
                                Մուտք
                            </Link>
                            <Link
                                to={`/register?type=${businessType}`}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                         text-white rounded-full text-sm hover:shadow-lg
                         hover:shadow-[#C5A28A]/30 transition-all duration-300"
                            >
                                Գրանցում
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden relative z-50 w-10 h-10 rounded-full bg-white shadow-lg
                       flex items-center justify-center"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ type: 'spring' as const, damping: 25 }}
                    className="fixed inset-0 bg-white z-40 md:hidden"
                >
                    <div className="flex flex-col h-full pt-24 p-6">
                        {/* Business Type Indicator */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10
                          rounded-xl border border-[#C5A28A]/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#8F6B58]">Ընտրված բիզնես</span>
                                <div className="flex items-center gap-2">
                                    {businessType === 'beauty' ? (
                                        <>
                                            <Sparkles size={16} className="text-[#C5A28A]" />
                                            <span className="text-sm font-light">Գեղեցկության սրահ</span>
                                        </>
                                    ) : (
                                        <>
                                            <Award size={16} className="text-[#C5A28A]" />
                                            <span className="text-sm font-light">Կլինիկա</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navigation Items */}
                        <div className="flex-1 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`
                    block py-4 px-6 rounded-xl text-lg transition-all
                    ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 text-[#C5A28A]'
                                        : 'text-[#2C2C2C] hover:bg-[#F5F0EB]'
                                    }
                  `}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="space-y-3 pt-6 border-t border-[#E8D5C4]/30">
                            <Link
                                to={`/login?type=${businessType}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full py-4 text-center text-[#2C2C2C] border border-[#C5A28A]/30
                         rounded-xl hover:bg-[#C5A28A]/5 transition-colors"
                            >
                                Մուտք
                            </Link>
                            <Link
                                to={`/register?type=${businessType}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full py-4 text-center bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                         text-white rounded-xl shadow-lg shadow-[#C5A28A]/30"
                            >
                                Գրանցում
                            </Link>
                        </div>

                        {/* Mobile Footer */}
                        <div className="mt-8 text-center text-sm text-[#8F6B58]">
                            <p>© 2024 SmartBook</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
};

export default Navigation;