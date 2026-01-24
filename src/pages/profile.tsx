
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useAuth } from '../contexts/auth-context';
import {
    Moon, Sun, Smartphone, Trophy, ChevronRight, Flame, LogOut, Trash2, AlertTriangle,
    DollarSign, Bell, Lock, BarChart3, HelpCircle, FileText,
    User as UserIcon, Mail, CreditCard, Crown, Calendar, Phone, Briefcase, MapPin, ChevronDown
} from 'lucide-react';
import { deleteUser } from 'firebase/auth';
import { PopoverSelect } from '../components/ui/in-app-select';
import { CalendarPicker } from '../components/ui/calendar-picker';

// Toggle Switch Component - Updated to Blue to match Notifications
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
    const { user, theme, toggleTheme, points, badges, streak, budget } = useStore();
    const { logout, firebaseUser } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Settings toggles
    const [budgetAlerts, setBudgetAlerts] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [analyticsSharing, setAnalyticsSharing] = useState(true);

    // PRO Member fields state
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [salaryRange, setSalaryRange] = useState('');
    const [occupation, setOccupation] = useState('');
    const [postcode, setPostcode] = useState('');

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

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        try {
            // Delete from Firebase Auth
            if (firebaseUser) {
                await deleteUser(firebaseUser);
            }
            navigate('/login');
        } catch (error: any) {
            // If requires re-authentication
            if (error.code === 'auth/requires-recent-login') {
                alert('For security, please sign out and sign back in before deleting your account.');
            } else {
                console.error('Delete account failed:', error);
                alert('Failed to delete account. Please try again.');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Sticky Gradient Header - Compacted */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-600 to-blue-600 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden transition-all duration-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-white">Profile</h1>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                            <Flame size={14} className="text-orange-300 fill-orange-300" />
                            <span className="text-xs font-bold text-white">{streak.currentStreak} Day Streak</span>
                        </div>
                    </div>

                    {/* User Profile Summary - Compacted */}
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
                            <p className="text-blue-100 text-xs truncate mb-1">{firebaseUser?.email || user.email}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.tier === 'PRO' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-white/20 text-white'}`}>
                                    {user.tier === 'PRO' ? 'Pro Member' : 'Free Tier'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-5 relative z-20 space-y-6">
                {/* Achievements Banner */}
                <Link to="/achievements" className="block transform transition-transform active:scale-98">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Trophy size={24} className="fill-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Achievements</h3>
                                <p className="text-sm text-gray-500">{badges.length} badges • {points.toLocaleString()} points</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                </Link>

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
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Account Info</h3>
                    <div className="space-y-4">
                        {/* Name - Editable */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Name</p>
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={editNameValue}
                                            onChange={(e) => setEditNameValue(e.target.value)}
                                            className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 w-40"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-xs text-gray-500">{user.name || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            {isEditingName ? (
                                <button
                                    onClick={() => {
                                        useStore.getState().updateUser({ name: editNameValue });
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            {firebaseUser?.emailVerified && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">VERIFIED</span>
                            )}
                        </div>

                        {/* PRO Member Fields - Only visible for PRO users */}
                        {user.tier === 'PRO' && (
                            <>
                                {/* Date of Birth */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                                            <p className="text-xs text-gray-500">
                                                {dob ? new Date(dob).toLocaleDateString('en-GB') : 'Not set'}
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-50 rounded-lg text-pink-500">
                                            <UserIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Gender</p>
                                            <p className="text-xs text-gray-500">{gender || 'Not set'}</p>
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-500">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Phone Number</p>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                                placeholder="01X-XXX XXXX"
                                                className="text-xs text-gray-500 bg-transparent border-none outline-none w-32"
                                            />
                                        </div>
                                    </div>
                                    {/* VERIFIED badge for PRO users */}
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">VERIFIED</span>
                                </div>

                                {/* Salary Range */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Salary Range</p>
                                            <p className="text-xs text-gray-500">{salaryRange || 'Not set'}</p>
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Occupation</p>
                                            <p className="text-xs text-gray-500">{occupation || 'Not set'}</p>
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Postcode</p>
                                            <input
                                                type="text"
                                                value={postcode}
                                                onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                                placeholder="XXXXX"
                                                maxLength={5}
                                                className="text-xs text-gray-500 bg-transparent border-none outline-none w-20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Budget Section */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Budget</h3>

                    {/* Monthly Budget Link - Renamed to Set Your Budget */}
                    <Link to="/budget" className="flex items-center justify-between py-3 border-b border-gray-50 group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <DollarSign size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Set Your Budget</p>
                                <p className="text-xs text-gray-500">Limit: {budget.total.toFixed(2)}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Budget Alerts - Moved here */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Bell size={18} />
                            </div>
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
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Preferences</h3>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                                <p className="text-xs text-gray-500">{theme === 'dark' ? 'On' : 'Off'}</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={theme === 'dark'} onChange={() => toggleTheme()} />
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-500">New receipt alerts</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />
                    </div>

                    {/* Analytics Sharing */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <BarChart3 size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Analytics Sharing</p>
                                <p className="text-xs text-gray-500">Share anonymous usage data</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={analyticsSharing} onChange={setAnalyticsSharing} />
                    </div>

                    {/* Biometric */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Lock size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Biometric Auth</p>
                                <p className="text-xs text-gray-500">Secure logic with FaceID</p>
                            </div>
                        </div>
                        <ToggleSwitch checked={biometricAuth} onChange={setBiometricAuth} />
                    </div>

                    {/* Currency - Moved from Account Info */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <CreditCard size={18} />
                            </div>
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
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
                    <Link to="#" className="flex items-center justify-between py-3 border-b border-gray-50 group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                                <HelpCircle size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Help Center</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="#" className="flex items-center justify-between py-3 group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                <FileText size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Terms & Privacy</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Danger Zone */}
                <div className="space-y-3">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-4 bg-white text-gray-500 rounded-2xl font-medium border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-medium border border-red-100 shadow-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                    <p className="text-center text-xs text-gray-400 pt-2">
                        Version 1.0.2 • Build 2405
                    </p>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>

                        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Account?</h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            This action cannot be undone. All your data, receipts, and settings will be permanently deleted.
                        </p>

                        <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <label className="text-xs text-gray-500 block mb-2 text-center uppercase tracking-wide">
                                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full text-center font-mono font-bold text-lg bg-white border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PopoverSelect Menus */}
            <PopoverSelect
                isOpen={openPopover === 'gender'}
                onClose={() => setOpenPopover(null)}
                anchorRef={genderRef}
                showIcons={false}
                options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                ]}
                value={gender}
                onSelect={(val) => setGender(val)}
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
                value={salaryRange}
                onSelect={(val) => setSalaryRange(val)}
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
                value={occupation}
                onSelect={(val) => setOccupation(val)}
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
                onSelect={(val) => useStore.getState().updateUser({ currency: val })}
            />

            {/* Calendar Picker for DOB */}
            <CalendarPicker
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                anchorRef={dobRef}
                value={dob}
                onChange={(date) => setDob(date)}
            />
        </div>
    );
}
