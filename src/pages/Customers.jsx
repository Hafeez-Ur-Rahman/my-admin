import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers, deleteUser } from '../services/api';
import StatusModal from '../components/common/StatusModal';
import ProfileModal from '../components/customers/ProfileModal';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletedCount, setDeletedCount] = useState(() => {
        const saved = localStorage.getItem('total_deleted_users');
        return saved ? parseInt(saved) : 0;
    });

    useEffect(() => {
        localStorage.setItem('total_deleted_users', deletedCount);
    }, [deletedCount]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'permission',
        title: '',
        message: '',
        userId: null,
        isLoading: false
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const cardsRef = useRef([]);
    const tableRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load users:", error);
            setUsers([]);
        }
        setLoading(false);
        
        // Animation after loading
        setTimeout(() => {
            const validCards = cardsRef.current.filter(el => el !== null);
            if (validCards.length > 0) {
                gsap.fromTo(validCards, 
                    { y: 50, opacity: 0 }, 
                    { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power4.out" }
                );
            }
            if (tableRef.current) {
                gsap.fromTo(tableRef.current, 
                    { y: 30, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" }
                );
            }
        }, 100);
    };

    const confirmDelete = (user) => {
        setModal({
            isOpen: true,
            type: 'permission',
            title: 'Terminate Access?',
            message: `Are you sure you want to permanently delete ${user.fullName}? This action cannot be reversed in the imperial records.`,
            userId: user._id,
            isLoading: false
        });
    };

    const handleDelete = async () => {
        const id = modal.userId;
        setModal(prev => ({ ...prev, isLoading: true }));
        
        const result = await deleteUser(id);
        
        if (result.success) {
            // Update state immediately for instant feedback in table and boxes
            setUsers(prev => prev.filter(u => u._id !== id));
            setDeletedCount(prev => prev + 1);
            
            // Show Success Modal
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Record Purged',
                message: 'The user has been successfully removed from the platform database.',
                userId: null,
                isLoading: false
            });
        } else {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Deletion Failed',
                message: result.message || 'An error occurred while trying to remove the user record.',
                userId: null,
                isLoading: false
            });
        }
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setIsProfileOpen(true);
    };

    const stats = {
        admins: users.filter(u => u.role === 'admin').length,
        customers: users.filter(u => u.role === 'customer').length,
        deleted: deletedCount
    };

    // Animate stats numbers when they change
    const adminCountRef = useRef(null);
    const customerCountRef = useRef(null);
    const deletedCountRef = useRef(null);

    useEffect(() => {
        if (adminCountRef.current) {
            gsap.to(adminCountRef.current, {
                innerText: stats.admins,
                duration: 1,
                snap: { innerText: 1 },
                ease: "power2.out"
            });
        }
    }, [stats.admins]);

    useEffect(() => {
        if (customerCountRef.current) {
            gsap.to(customerCountRef.current, {
                innerText: stats.customers,
                duration: 1,
                snap: { innerText: 1 },
                ease: "power2.out"
            });
        }
    }, [stats.customers]);

    useEffect(() => {
        if (deletedCountRef.current) {
            // Reset the text first to ensure clean animation
            deletedCountRef.current.innerText = stats.deleted - (stats.deleted > 0 ? 1 : 0);
            
            gsap.fromTo(deletedCountRef.current, 
                { scale: 1.8, color: '#f43f5e', filter: 'blur(5px)' },
                { scale: 1, color: '#ffffff', filter: 'blur(0px)', duration: 0.8, ease: "elastic.out(1, 0.3)" }
            );
            gsap.to(deletedCountRef.current, {
                innerText: stats.deleted,
                duration: 1.2,
                snap: { innerText: 1 },
                ease: "power3.out"
            });
        }
    }, [stats.deleted]);

    // Memoized filtered users for performance and solid data connection
    const filteredUsers = React.useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return users.filter(user => {
            const matchesSearch = 
                (user.fullName || "").toLowerCase().includes(term) || 
                (user.name || "").toLowerCase().includes(term) ||
                (user.firstName || "").toLowerCase().includes(term) ||
                (user.lastName || "").toLowerCase().includes(term) ||
                (user.email || "").toLowerCase().includes(term) ||
                (user.phone || "").toLowerCase().includes(term) ||
                (user._id || "").toLowerCase().includes(term);
            
            const matchesRole = filterRole === 'all' || user.role === filterRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, filterRole]);

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div ref={headerRef} className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl md:text-4xl font-luxury text-white tracking-tight italic">
                        Customer <span className="bg-gradient-to-r from-[#4d003e] to-[#c026d3] bg-clip-text text-transparent">Management</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-xs font-medium uppercase tracking-[0.2em]">
                        View and manage platform users
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-accent-pink/60 group-focus-within:text-accent-pink transition-all duration-300 text-lg z-10"></i>
                        <input 
                            type="text" 
                            placeholder="Search by name, email, phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            className="bg-[#1a1625]/80 border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:border-accent-pink/30 focus:ring-4 focus:ring-accent-pink/5 transition-all w-full md:w-80 backdrop-blur-md text-white placeholder:text-white/20"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                            >
                                <i className="ri-close-circle-fill"></i>
                            </button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-card/50 border border-white/5 rounded-2xl pl-6 pr-12 py-3.5 text-sm focus:outline-none focus:border-accent-pink/30 transition-all backdrop-blur-md text-white cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="customer">Customers</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-accent-pink pointer-events-none"></i>
                    </div>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('adminToken');
                            localStorage.removeItem('adminUser');
                            localStorage.setItem('registerNewAdmin', 'true');
                            window.dispatchEvent(new Event('auth-change'));
                            navigate('/auth?register=true');
                        }}
                        className="flex-shrink-0 group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#4d003e] to-[#c026d3] text-white font-bold rounded-2xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] active:scale-95 shadow-xl w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
                        <i className="ri-shield-star-line text-lg relative z-10"></i>
                        <span className="relative z-10 tracking-widest uppercase text-[10px] font-bold">New Admin</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Admins', value: stats.admins, icon: 'ri-shield-user-line', color: 'rose-500', sub: 'Authorized Personnel' },
                    { label: 'Total Customers', value: stats.customers, icon: 'ri-group-line', color: 'accent-pink', sub: 'Active Platform Users' },
                    { label: 'Deleted Users', value: stats.deleted, icon: 'ri-delete-bin-7-line', color: 'danger', sub: 'Actions This Session' }
                ].map((stat, i) => (
                    <div 
                        key={stat.label}
                        ref={el => cardsRef.current[i] = el}
                        className="relative group cursor-default overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br from-card to-card/40 rounded-[32px] border border-white/5 -z-10 group-hover:border-${stat.color === 'accent-pink' ? 'accent-pink' : stat.color}/20 transition-all duration-500`}></div>
                        <div className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-${stat.color === 'accent-pink' ? 'accent-pink' : stat.color}/10 border border-${stat.color === 'accent-pink' ? 'accent-pink' : stat.color}/20 flex items-center justify-center text-2xl text-${stat.color === 'accent-pink' ? 'accent-pink' : stat.color} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                <i className={stat.icon}></i>
                            </div>
                            <div>
                                <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span 
                                        ref={stat.label === 'Total Admins' ? adminCountRef : stat.label === 'Total Customers' ? customerCountRef : deletedCountRef}
                                        className="text-4xl font-bold text-white font-luxury italic"
                                    >
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative dynamic glow */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color === 'accent-pink' ? 'accent-pink' : stat.color}/5 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150 ${stat.label === 'Deleted Users' && stats.deleted > 0 ? 'animate-pulse bg-rose-500/10' : ''}`}></div>
                        {stat.label === 'Deleted Users' && stats.deleted > 0 && (
                            <div className="absolute top-4 right-8">
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div 
                ref={tableRef}
                className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
            >
                <div className="p-5 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="ri-list-check text-accent-pink"></i>
                        User Directory
                    </h2>
                    <span className="px-3 py-1 w-fit bg-accent-pink/10 border border-accent-pink/20 rounded-full text-[10px] font-bold text-accent-pink uppercase tracking-tighter">
                        {filteredUsers.length} Users Found
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">Full Name</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">Email & Phone</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">Role</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">Address</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-2 border-accent-pink/20 border-t-accent-pink rounded-full animate-spin"></div>
                                                <p className="text-text-muted font-bold text-xs uppercase tracking-widest animate-pulse">Refining User Data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <p className="text-text-muted font-bold text-sm uppercase tracking-widest">No users match your criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <motion.tr 
                                            key={user._id} 
                                            id={`user-row-${user._id}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="group hover:bg-white/[0.03] transition-all duration-300 border-b border-white/5"
                                        >
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-pink/20 to-purpleGlow/20 flex items-center justify-center text-accent-pink font-luxury font-bold border border-white/5 shadow-inner">
                                                        {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-luxury italic text-lg tracking-wide group-hover:text-accent-pink transition-colors">{user.fullName || user.name || "Unknown User"}</div>
                                                        <div className="text-[10px] text-text-muted font-medium mt-0.5">ID: {(user._id || "").slice(-8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-white/80 text-sm font-medium flex items-center gap-2">
                                                        <i className="ri-mail-line text-accent-pink/50"></i>
                                                        {user.email}
                                                    </div>
                                                    <div className="text-text-muted text-xs flex items-center gap-2">
                                                        <i className="ri-phone-line text-accent-pink/30"></i>
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <span className={`px-4 py-1.5 rounded-luxury text-[10px] font-black uppercase tracking-widest ${
                                                    user.role === 'admin' 
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                                    : 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 max-w-[200px] md:max-w-[250px]">
                                                <div className="text-text-muted text-xs leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:text-white/70 transition-all">
                                                    {user.address}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleViewProfile(user)}
                                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-accent-pink/20 hover:text-accent-pink hover:border-accent-pink/30 transition-all duration-300"
                                                        title="View Profile"
                                                    >
                                                        <i className="ri-eye-line"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmDelete(user)}
                                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-danger/20 hover:text-danger hover:border-danger/30 transition-all duration-300"
                                                        title="Terminate User"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Modal */}
            <StatusModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.type === 'permission' ? handleDelete : closeModal}
                onCancel={closeModal}
                isLoading={modal.isLoading}
            />
            {/* Profile Modal */}
            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={selectedUser}
            />

        </div>
    );
};

export default Customers;
