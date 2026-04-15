import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Archive, Trash2, Mail, Info, AlertTriangle, AlertCircle, Clock, ChevronDown, Link, ArchiveRestore, MailCheck } from 'lucide-react';
// FIX: Using alias paths which should be correctly resolved by the project's build configuration.
import { useAuth } from '@/providers/AuthContext';
import { NotificationsService, Notification, NotificationTarget, NotificationUpdate, NotificationStatus } from '@/api';

// --- Type Definitions ---

// We'll use the generated Notification type but add a frontend-specific flag for display logic.
interface DisplayNotification extends Notification {
    isUnreadForCurrentUser: boolean;
}

// Defines the allowed values for sorting, improving type safety.
type SortCriteria = 'created_at' | 'notification_type' | 'status';


const getInvestmentLink = (notification: DisplayNotification): string | null => {
    if (!notification.investment_id || !notification.related_type) return null;

    // This function builds a URL based on the notification's related_type.
    switch (notification.related_type.toUpperCase()) {
        case 'IDEA':
            return `/ideas/${notification.investment_id}`;
        case 'PROJECT':
            return `/projects/${notification.investment_id}`;
        default:
            return null;
    }
};

const NotificationIcon = ({ type }: { type: DisplayNotification['notification_type'] }) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
        case 'INFO':
            return <Info {...iconProps} style={{ color: 'hsl(217, 91%, 60%)' }} />;
        case 'WARNING':
            return <AlertTriangle {...iconProps} style={{ color: '#f59e0b' }} />;
        case 'ALERT':
            return <AlertCircle {...iconProps} style={{ color: 'hsl(356.3033, 90.5579%, 54.3137%)' }} />;
        case 'REMINDER':
            return <Clock {...iconProps} style={{ color: '#8b5cf6' }} />;
        default:
            return <Bell {...iconProps} />;
    }
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};



const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => (
    <aside className="w-[20%] bg-sidebar-bg border-r border-border p-4 flex flex-col space-y-2 flex-shrink-0">
        <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${activeTab === 'inbox'
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
        >
            <Mail className="w-5 h-5" />
            <span>Inbox</span>
        </button>
        <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${activeTab === 'archived'
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
        >
            <Archive className="w-5 h-5" />
            <span>Archived</span>
        </button>
    </aside>
);

const NotificationList = ({ notifications, onNotificationSelect, selectedNotificationId, sortCriteria, setSortCriteria, onMarkAllAsRead, hasUnread }: { notifications: DisplayNotification[], onNotificationSelect: (notification: DisplayNotification) => void, selectedNotificationId: number | null, sortCriteria: SortCriteria, setSortCriteria: (criteria: SortCriteria) => void, onMarkAllAsRead: () => void, hasUnread: boolean }) => (
    <div className="w-[30%] border-r border-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border flex items-center w-[95%] mx-auto h-[70px] gap-2">
            <div className="relative flex-1 flex items-center">
                <select
                    value={sortCriteria}
                    onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
                    className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="created_at">Sort by Date</option>
                    <option value="notification_type">Sort by Type</option>
                    <option value="status">Sort by Status (Unread First)</option>
                </select>

                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
                onClick={onMarkAllAsRead}
                disabled={!hasUnread}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mark all as read"
            >
                <MailCheck className="w-5 h-5" />
            </button>
        </div>

        <div className="overflow-auto hide-scrollbar justify-between items-center w-[90%] mx-auto ">
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <div
                        key={notification.id}
                        onClick={() => onNotificationSelect(notification)}
                        className={`p-4 border-border cursor-pointer transition-all duration-200  mt-4 mb-4 rounded-xl ${
                            selectedNotificationId === notification.id
                                ? 'bg-accent text-accent-foreground ring-2 ring-ring'
                                : notification.isUnreadForCurrentUser
                                ? 'bg-sidebar-bg hover:bg-accent/50'
                                : 'bg-muted hover:bg-accent/50'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3 overflow-hidden">
                                <div className="mt-1 flex-shrink-0">
                                    <NotificationIcon type={notification.notification_type} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold break-words ${selectedNotificationId === notification.id ? 'text-accent-foreground' : notification.isUnreadForCurrentUser ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</h3>
                                    <p className="text-sm text-muted-foreground break-words line-clamp-3">{notification.message}</p>
                                </div>
                            </div>
                            {notification.isUnreadForCurrentUser && (
                                <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 ml-2 flex-shrink-0"></div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-2">{formatDate(notification.created_at)}</p>
                    </div>
                ))
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <p>No notifications here.</p>
                </div>
            )}
        </div>
    </div>
);


const NotificationDetail = ({ notification, onArchive, onDelete, onUnarchive }: { notification: DisplayNotification | null, onArchive: (id: number) => void, onDelete: (id: number) => void, onUnarchive: (id: number) => void }) => {
    if (!notification) {
        return (
            <div className="w-[70%] flex items-center justify-center bg-background text-muted-foreground">
                <div className="text-center">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-border" />
                    <h2 className="text-xl">Select a notification to read</h2>
                    <p>Nothing selected.</p>
                </div>
            </div>
        );
    }

    const investmentLink = getInvestmentLink(notification);

    return (
        <div className="w-[70%] flex flex-col bg-sidebar-bg">
            <div className="p-4 border-b border-border flex justify-between items-center w-[95%] mx-auto h-[70px]">
                <h1 className="text-xl font-bold text-foreground break-words">{notification.title}</h1>
                <div className="flex items-center space-x-2">
                    {notification.status === NotificationStatus.ARCHIVED ? (
                        <button onClick={() => onUnarchive(notification.id)} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                            <ArchiveRestore className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={() => onArchive(notification.id)} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                            <Archive className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => onDelete(notification.id)} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <NotificationIcon type={notification.notification_type} />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">System Notification</p>
                        <p className="text-sm text-muted-foreground">to: you</p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">{formatDate(notification.created_at)}</p>
                </div>

                <div className="prose prose-sm max-w-none text-foreground break-words">
                    <p>{notification.message}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-border space-y-3">
                    <h4 className="font-semibold text-foreground">Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {notification.investment_id && (
                            <>
                                <p className="text-muted-foreground">Investment ID:</p>
                                {investmentLink ? (
                                    <a href={investmentLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1.5 transition-colors font-mono">
                                        #{notification.investment_id}
                                        <Link className="w-3.5 h-3.5" />
                                    </a>
                                ) : (
                                    <p className="text-foreground font-mono">#{notification.investment_id}</p>
                                )}
                            </>
                        )}
                        {notification.related_type && notification.related_id && (
                            <>
                                <p className="text-muted-foreground">Related To:</p>
                                <p className="text-foreground">
                                    <span className="font-mono bg-muted px-2 py-1 rounded-md text-xs">{notification.related_type}</span>
                                    <span className="font-mono"> #{notification.related_id}</span>
                                </p>
                            </>
                        )}
                        <p className="text-muted-foreground">Type:</p>
                        <p className="text-foreground">
                            <span className={`font-mono px-2 py-1 rounded-md text-xs ${notification.notification_type === 'ALERT' ? 'bg-destructive/10 text-destructive' :
                                notification.notification_type === 'WARNING' ? 'bg-yellow-400/10 text-yellow-500' :
                                    notification.notification_type === 'REMINDER' ? 'bg-purple-400/10 text-purple-500' :
                                        'bg-accent text-accent-foreground'
                                }`}>
                                {notification.notification_type}
                            </span>
                        </p>
                        <p className="text-muted-foreground">Status:</p>
                        <p className="text-foreground">{notification.status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const NotificationCenter = () => {
    const { user: currentUser, isLoading: isAuthLoading } = useAuth();
    const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('inbox');
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('created_at');

    useEffect(() => {
        if (!currentUser || isAuthLoading) return;

        const fetchNotifications = async () => {
            try {
                const data: Notification[] = await NotificationsService.readUserNotificationsApiNotificationsUserUserIdGet({
                    userId: currentUser.id,
                });

                const processedNotifications: DisplayNotification[] = data.map(n => {
                    const userTarget = n.targets?.find(t => t.target_type === 'USER' && t.target_id === currentUser.id);
                    return {
                        ...n,
                        isUnreadForCurrentUser: userTarget ? userTarget.read_at === null : false,
                    };
                });
                setNotifications(processedNotifications);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
    }, [currentUser, isAuthLoading]);

    const handleNotificationSelect = async (notification: DisplayNotification) => {
        setSelectedNotificationId(notification.id);

        const userTarget = notification.targets?.find(t => t.target_type === 'USER' && t.target_id === currentUser?.id);

        if (notification.isUnreadForCurrentUser && userTarget) {
            try {
                await NotificationsService.markNotificationTargetAsReadApiNotificationsTargetTargetIdReadPatch({
                    targetId: userTarget.id,
                });

                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, isUnreadForCurrentUser: false } : n
                ));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
    };

    const handleArchive = async (id: number) => {
        try {
            const requestBody: NotificationUpdate = { status: NotificationStatus.ARCHIVED };
            await NotificationsService.updateNotificationStatusApiNotificationsNotificationIdStatusPatch({
                notificationId: id,
                requestBody: requestBody,
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: NotificationStatus.ARCHIVED } : n));
            if (selectedNotificationId === id) setSelectedNotificationId(null);
        } catch (error) {
            console.error('Failed to archive notification:', error);
        }
    };

    const handleUnarchive = async (id: number) => {
        try {
            const requestBody: NotificationUpdate = { status: NotificationStatus.ACTIVE };
            await NotificationsService.updateNotificationStatusApiNotificationsNotificationIdStatusPatch({
                notificationId: id,
                requestBody: requestBody,
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: NotificationStatus.ACTIVE } : n));
            if (selectedNotificationId === id) setSelectedNotificationId(null);
        } catch (error) {
            console.error('Failed to unarchive notification:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await NotificationsService.deleteNotificationApiNotificationsNotificationIdDelete({ notificationId: id });
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selectedNotificationId === id) setSelectedNotificationId(null);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };
    
    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
    
        const unreadTargets = notifications
            .filter(n => n.isUnreadForCurrentUser)
            .map(n => n.targets?.find(t => t.target_type === 'USER' && t.target_id === currentUser.id))
            .filter((t): t is NotificationTarget => t !== undefined);
    
        if (unreadTargets.length === 0) return;
    
        try {
            await Promise.all(
                unreadTargets.map(target =>
                    NotificationsService.markNotificationTargetAsReadApiNotificationsTargetTargetIdReadPatch({
                        targetId: target.id,
                    })
                )
            );
    
            setNotifications(prev =>
                prev.map(n => ({ ...n, isUnreadForCurrentUser: false }))
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSelectedNotificationId(null);
    };

    const sortedNotifications = useMemo(() => {
        const visibleNotifications = notifications.filter(n => {
            if (activeTab === 'inbox') return n.status === NotificationStatus.ACTIVE;
            if (activeTab === 'archived') return n.status === NotificationStatus.ARCHIVED;
            return false;
        });

        return [...visibleNotifications].sort((a, b) => {
            switch (sortCriteria) {
                case 'notification_type':
                    return a.notification_type.localeCompare(b.notification_type);
                case 'status':
                    // This logic sorts by unread status first.
                    if (a.isUnreadForCurrentUser && !b.isUnreadForCurrentUser) return -1;
                    if (!a.isUnreadForCurrentUser && b.isUnreadForCurrentUser) return 1;
                    // For items with the same read status, it falls back to sorting by date.
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'created_at':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [notifications, activeTab, sortCriteria]);

    const selectedNotification = notifications.find(n => n.id === selectedNotificationId) || null;
    
    const hasUnread = useMemo(() => notifications.some(n => n.isUnreadForCurrentUser && n.status === NotificationStatus.ACTIVE), [notifications]);

    return (
        <div
            className="rounded-xl shadow-sm border flex overflow-hidden font-sans antialiased"
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                borderColor: 'var(--border)',
                height: '87vh'
            }}
        >
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
            <main className="flex-1 flex flex-row overflow-hidden">
                <NotificationList
                    notifications={sortedNotifications}
                    onNotificationSelect={handleNotificationSelect}
                    selectedNotificationId={selectedNotificationId}
                    sortCriteria={sortCriteria}
                    setSortCriteria={setSortCriteria}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    hasUnread={hasUnread}
                />
                <NotificationDetail
                    notification={selectedNotification}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onUnarchive={handleUnarchive}
                />
            </main>
        </div>
    );
};

export default NotificationCenter;

