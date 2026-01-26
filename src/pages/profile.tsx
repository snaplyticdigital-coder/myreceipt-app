
import { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useAuth } from '../contexts/auth-context';
import { calculateProfileCompletion, getCompletionHint } from '../lib/profile-completion';
import { validateMalaysianPostcode } from '../lib/locations';
import {
    Moon, Sun, Smartphone, Trophy, ChevronRight, Flame, LogOut, Trash2, Shield,
    Wallet, Bell, Lock, BarChart3, HelpCircle, FileText, CheckCircle2, XCircle,
    User as UserIcon, Mail, CreditCard, Crown, Calendar, Phone, Briefcase, MapPin, ChevronDown, Banknote, Settings
} from 'lucide-react';
import { PopoverSelect } from '../components/ui/in-app-select';
import { CalendarPicker } from '../components/ui/calendar-picker';
import { SectionHeader } from '../components/ui/section-header';
import { TacVerificationModal } from '../components/modals/tac-verification-modal';
import { LogoutConfirmModal } from '../components/modals/logout-confirm-modal';

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, theme, toggleTheme, streak, budget, updateUser } = useStore();
    const { logout, firebaseUser } = useAuth();
    const [showTacModal, setShowTacModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Settings toggles
    const [budgetAlerts, setBudgetAlerts] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [analyticsSharing, setAnalyticsSharing] = useState(true);

    // Edit Name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState(user.name || '');

    // Popover/Calendar state
    const [showCalendar, setShowCalendar] = useState(false);
    const [openPopover, setOpenPopover] = useState<'gender' | 'salary' | 'occupation' | 'currency' | null>(null);
    const dobRef = useRef<HTMLButtonElement>(null);
    const genderRef = useRef<HTMLButtonElement>(null);
    const salaryRef = useRef<HTMLButtonElement>(null);
    const occupationRef = useRef<HTMLButtonElement>(null);
    const currencyRef = useRef<HTMLButtonElement>(null);

    // Profile completion calculation
    const profileCompletion = useMemo(() => calculateProfileCompletion(user), [user]);
    const completionHint = useMemo(() => getCompletionHint(user), [user]);

    // Postcode validation
    const postcodeValidation = useMemo(() => {
        if (!user.postcode || user.postcode.length !== 5) return null;
        return validateMalaysianPostcode(user.postcode);
    }, [user.postcode]);

    // Check if a field is incomplete for highlighting
    const isFieldIncomplete = (field: string): boolean => {
        return profileCompletion.incompleteFields.includes(field as any);
    };

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Sign out failed:', error);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    // Handle postcode change with auto-population of state
    const handlePostcodeChange = (value: string) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 5);
        updateUser({ postcode: cleanValue });

        if (cleanValue.length === 5) {
            const validation = validateMalaysianPostcode(cleanValue);
            if (validation.valid && validation.state) {
                updateUser({ postcodeState: validation.state });
            } else {
                updateUser({ postcodeState: undefined });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Sticky Gradient Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden transition-all duration-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-white">Profile</h1>
                        <div className="flex items-center gap-2">
                            {/* Streak Pill */}
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                                <Flame size={14} className="text-orange-300 fill-orange-300" />
                                <span className="text-xs font-bold text-white">{streak.currentStreak} Day Streak</span>
                            </div>

                            {/* Trophy Icon - Achievement Entry Point (Cyber-Luxe Minimalist) */}
                            <button
                                onClick={() => navigate('/achievements')}
                                className="p-2 rounded-full bg-white/10 backdrop-blur-[10px] border border-white/20 transition-all active:scale-95 hover:bg-white/20"
                            >
                                <Trophy
                                    size={16}
                                    className="text-white"
                                    strokeWidth={1.5}
                                />
                            </button>
                        </div>
                    </div>

                    {/* User Profile Summary */}
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 bg-white rounded-full p-0.5 shadow-lg">
                            {firebaseUser?.photoURL ? (
                                <img src={firebaseUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                                    {(user.name || firebaseUser?.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white leading-tight truncate">
                                {firebaseUser?.displayName || user.name || 'User'}
                            </h2>
                            <p className="text-blue-100 text-xs truncate mb-2">{firebaseUser?.email || user.email}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full ${user.tier === 'PRO' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-white/20 text-white'}`}>
                                    {user.tier === 'PRO' ? 'Pro Member' : 'Free Tier'}
                                </span>
                                {user.tier === 'PRO' && user.proExpiryDate && (
                                    <span className="text-xs font-bold text-blue-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 uppercase">
                                        PRO UNTIL {new Date(user.proExpiryDate).toLocaleDateString('en-GB')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decoupled Referral Card - 16dp margin from header */}
            <div className="px-5 mt-4 relative z-20">
                <div
                    onClick={() => navigate('/referral')}
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-4 shadow-lg shadow-purple-500/20 relative overflow-hidden group transition-all hover:shadow-xl active:scale-[0.98]"
                >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-white/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl -ml-6 -mb-6" />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                                    Limited Offer
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-white leading-tight mb-1">
                                Get 7 Days of Pro!
                            </h3>
                            <p className="text-xs text-blue-100/90 font-medium">
                                Share the savings with your besties.
                            </p>
                        </div>
                        <div className="shrink-0 bg-white rounded-full p-2 shadow-md group-hover:scale-110 transition-transform">
                            <ChevronRight className="text-purple-600" size={20} strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 mt-4 relative z-20 space-y-6">
                {/* Upgrade Banner - Only for Free Tier */}
                {user.tier === 'FREE' && (
                    <div className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                    <Crown size={24} className="fill-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Upgrade to Pro</h3>
                                    <p className="text-xs text-amber-700 font-medium">Unlock advanced insights & storage</p>
                                </div>
                            </div>
                            <button
                                onClick={() => useStore.getState().upgradeToPro()}
                                className="bg-white text-amber-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-amber-50 transition-colors active:scale-95"
                            >
                                Upgrade
                            </button>
                        </div>
                    </div>
                )}

                {/* Account Information */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader
                        title="Account Info"
                        subtitle={`${profileCompletion.percentage}% Complete`}
                        icon={<UserIcon />}
                        className="mb-4"
                    />

                    {/* Profile Completion Progress Bar */}
                    <div className="mb-5">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${profileCompletion.percentage >= 100
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                    }`}
                                style={{ width: `${profileCompletion.percentage}%` }}
                            />
                        </div>
                        {completionHint && (
                            <p className="text-xs text-gray-400 mt-1.5">{completionHint}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Name - Editable */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('name') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <UserIcon size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Name</p>
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={editNameValue}
                                            onChange={(e) => setEditNameValue(e.target.value)}
                                            className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 w-40 mt-1"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">{user.name || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            {isEditingName ? (
                                <button
                                    onClick={() => {
                                        updateUser({ name: editNameValue });
                                        setIsEditingName(false);
                                    }}
                                    className="text-xs font-semibold text-white px-3 py-1 bg-blue-600 rounded-full hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setEditNameValue(user.name || '');
                                        setIsEditingName(true);
                                    }}
                                    className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between py-1 px-2 -mx-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Email</p>
                                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                VERIFIED
                            </span>
                        </div>

                        {/* Date of Birth */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('dob') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Date of Birth</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : 'Not set'}
                                    </p>
                                </div>
                            </div>
                            <button
                                ref={dobRef}
                                onClick={() => setShowCalendar(true)}
                                className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 flex items-center gap-1"
                            >
                                Select <ChevronDown size={12} />
                            </button>
                        </div>

                        {/* Gender */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('gender') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <UserIcon size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Gender</p>
                                    <p className="text-xs text-gray-500 mt-1">{user.gender || 'Not set'}</p>
                                </div>
                            </div>
                            <button
                                ref={genderRef}
                                onClick={() => setOpenPopover('gender')}
                                className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 flex items-center gap-1"
                            >
                                Select <ChevronDown size={12} />
                            </button>
                        </div>

                        {/* Phone Number */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('phone') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Phone Number</p>
                                    <input
                                        type="tel"
                                        value={user.phone || ''}
                                        onChange={(e) => updateUser({ phone: e.target.value.replace(/\D/g, '') })}
                                        placeholder="01X-XXX XXXX"
                                        className="text-xs text-gray-500 bg-transparent border-none outline-none w-32 mt-1"
                                    />
                                </div>
                            </div>
                            {user.phoneVerified ? (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={10} />
                                    VERIFIED
                                </span>
                            ) : (
                                <button
                                    onClick={() => setShowTacModal(true)}
                                    className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-red-100"
                                >
                                    <XCircle size={10} />
                                    UNVERIFIED
                                </button>
                            )}
                        </div>

                        {/* Salary Range */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('salary') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Banknote size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Salary Range</p>
                                    <p className="text-xs text-gray-500 mt-1">{user.salaryRange || 'Not set'}</p>
                                </div>
                            </div>
                            <button
                                ref={salaryRef}
                                onClick={() => setOpenPopover('salary')}
                                className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 flex items-center gap-1"
                            >
                                Select <ChevronDown size={12} />
                            </button>
                        </div>

                        {/* Occupation */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('occupation') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Briefcase size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Occupation</p>
                                    <p className="text-xs text-gray-500 mt-1">{user.occupation || 'Not set'}</p>
                                </div>
                            </div>
                            <button
                                ref={occupationRef}
                                onClick={() => setOpenPopover('occupation')}
                                className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 flex items-center gap-1"
                            >
                                Select <ChevronDown size={12} />
                            </button>
                        </div>

                        {/* Postcode */}
                        <div className={`flex items-center justify-between py-1 px-2 -mx-2 rounded-lg ${isFieldIncomplete('postcode') ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-slate-400" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">Postcode</p>
                                    <input
                                        type="text"
                                        value={user.postcode || ''}
                                        onChange={(e) => handlePostcodeChange(e.target.value)}
                                        placeholder="XXXXX"
                                        maxLength={5}
                                        className="text-xs text-gray-500 bg-transparent border-none outline-none w-20 mt-1"
                                    />
                                </div>
                            </div>
                            {user.postcode && user.postcode.length === 5 && (
                                postcodeValidation?.valid ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        {postcodeValidation.state}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                        Invalid
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget Section */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader title="Budget" icon={<Wallet />} className="mb-4" />

                    <Link to="/budget" className="flex items-center justify-between py-3 border-b border-gray-50 group">
                        <div className="flex items-center gap-3">
                            <Wallet size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Set Your Budget</p>
                                <p className="text-xs text-gray-500">Limit: {budget.total.toFixed(2)}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <Bell size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Budget Alerts</p>
                                <p className="text-xs text-gray-500">Get notified near limits</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={budgetAlerts} onChange={setBudgetAlerts} />
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader title="Preferences" icon={<Settings />} className="mb-4" />

                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon size={18} className="text-slate-400" strokeWidth={1.5} /> : <Sun size={18} className="text-slate-400" strokeWidth={1.5} />}
                            <div>
                                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                                <p className="text-xs text-gray-500">{theme === 'dark' ? 'On' : 'Off'}</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={theme === 'dark'} onChange={() => toggleTheme()} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <Smartphone size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-500">New receipt alerts</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Analytics Sharing</p>
                                <p className="text-xs text-gray-500">Share anonymous usage data</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={analyticsSharing} onChange={setAnalyticsSharing} />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <Lock size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Biometric Auth</p>
                                <p className="text-xs text-gray-500">Secure logic with FaceID</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={biometricAuth} onChange={setBiometricAuth} />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Currency</p>
                                <p className="text-xs text-gray-500">{user.currency || 'RM'}</p>
                            </div>
                        </div>
                        <button
                            ref={currencyRef}
                            onClick={() => setOpenPopover('currency')}
                            className="text-xs font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 flex items-center gap-1"
                        >
                            Change <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                {/* Support & Legal */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader title="Support" icon={<HelpCircle />} className="mb-4" />
                    <Link to="#" className="flex items-center justify-between py-3 border-b border-gray-50 group">
                        <div className="flex items-center gap-3">
                            <HelpCircle size={18} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-900">Help Center</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="#" className="flex items-center justify-between py-3 group">
                        <div className="flex items-center gap-3">
                            <FileText size={18} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-900">Terms & Privacy</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Account Management */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <SectionHeader title="Account Management" icon={<Shield />} className="mb-4" />

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-between py-3 border-b border-gray-50 group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-900">Sign Out</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/delete-account')}
                        className="w-full flex items-center justify-between py-3 group"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 size={18} className="text-red-400" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-red-600">Delete Account</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Version Info */}
                <p className="text-center text-xs text-gray-400 pt-2 pb-4">
                    Version 1.0.2 • Build 2405
                </p>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleSignOut}
                isLoading={isLoggingOut}
            />

            {/* TAC Verification Modal */}
            <TacVerificationModal
                isOpen={showTacModal}
                onClose={() => setShowTacModal(false)}
                onVerify={() => {
                    updateUser({ phoneVerified: true });
                    setShowTacModal(false);
                }}
                phone={user.phone || ''}
            />

            {/* PopoverSelect Menus */}
            <PopoverSelect
                isOpen={openPopover === 'gender'}
                onClose={() => setOpenPopover(null)}
                anchorRef={genderRef}
                showIcons={false}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                ]}
                value={user.gender || ''}
                onSelect={(val) => updateUser({ gender: val as 'Male' | 'Female' | 'Other' })}
            />
            <PopoverSelect
                isOpen={openPopover === 'salary'}
                onClose={() => setOpenPopover(null)}
                anchorRef={salaryRef}
                showIcons={false}
                options={[
                    { value: 'Below RM 2,000', label: 'Below RM 2,000' },
                    { value: 'RM 2,000 - 4,000', label: 'RM 2,000 - 4,000' },
                    { value: 'RM 4,000 - 6,000', label: 'RM 4,000 - 6,000' },
                    { value: 'RM 6,000 - 10,000', label: 'RM 6,000 - 10,000' },
                    { value: 'RM 10,000 - 15,000', label: 'RM 10,000 - 15,000' },
                    { value: 'Above RM 15,000', label: 'Above RM 15,000' }
                ]}
                value={user.salaryRange || ''}
                onSelect={(val) => updateUser({ salaryRange: val })}
            />
            <PopoverSelect
                isOpen={openPopover === 'occupation'}
                onClose={() => setOpenPopover(null)}
                anchorRef={occupationRef}
                showIcons={false}
                options={[
                    { value: 'Student', label: 'Student' },
                    { value: 'Employee', label: 'Employee' },
                    { value: 'Self-Employed', label: 'Self-Employed' },
                    { value: 'Business Owner', label: 'Business Owner' },
                    { value: 'Freelancer', label: 'Freelancer' },
                    { value: 'Retired', label: 'Retired' },
                    { value: 'Other', label: 'Other' }
                ]}
                value={user.occupation || ''}
                onSelect={(val) => updateUser({ occupation: val })}
            />
            <PopoverSelect
                isOpen={openPopover === 'currency'}
                onClose={() => setOpenPopover(null)}
                anchorRef={currencyRef}
                showIcons={false}
                options={[
                    { value: 'RM', label: 'RM' },
                    { value: 'USD', label: 'USD' }
                ]}
                value={user.currency || 'RM'}
                onSelect={(val) => updateUser({ currency: val })}
            />

            {/* Calendar Picker for DOB */}
            <CalendarPicker
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                anchorRef={dobRef}
                value={user.dateOfBirth || ''}
                onChange={(date) => updateUser({ dateOfBirth: date })}
            />
        </div>
    );
}
