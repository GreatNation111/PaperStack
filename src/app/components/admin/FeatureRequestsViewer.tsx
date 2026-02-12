import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flag, Search } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FeatureRequest {
    id: string;
    userId: string;
    feature: string;
    timestamp: any;
}

interface GroupedRequest {
    featureKey: string;
    count: number;
    lastRequested: any;
}

export function FeatureRequestsViewer() {
    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'feature_interest'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as any));
            setRequests(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching feature requests:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const groupedRequests: GroupedRequest[] = Object.values(requests.reduce((acc, curr: any) => {
        const key = curr.feature || 'unknown';
        if (!acc[key]) {
            acc[key] = {
                featureKey: key,
                count: 0,
                lastRequested: curr.timestamp
            };
        }
        acc[key].count += 1;
        if (curr.timestamp > acc[key].lastRequested) {
            acc[key].lastRequested = curr.timestamp;
        }
        return acc;
    }, {} as Record<string, GroupedRequest>));

    const sortedRequests = groupedRequests
        .sort((a, b) => b.count - a.count)
        .filter(r => r.featureKey.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatFeatureName = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
    };

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-[#E5E5E5] mb-2">Feature Requests</h1>
                <p className="text-sm text-[#AAA]">Users explicitly requested these features via "Notify Me"</p>
            </div>

            <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search requests..."
                        className="w-full h-11 pl-10 pr-4 bg-[#0F1115] border border-[#333] rounded-lg text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-5">
                    <div className="text-sm text-[#AAA] mb-1">Total Requests</div>
                    <div className="text-2xl font-semibold text-[#E5E5E5]">{requests.length}</div>
                </div>
                <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl p-5">
                    <div className="text-sm text-[#AAA] mb-1">Unique Features</div>
                    <div className="text-2xl font-semibold text-[#E5E5E5]">{groupedRequests.length}</div>
                </div>
            </div>

            <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2A2A2F]">
                                <th className="px-6 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Feature / Request</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Interest Count</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Last Requested</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[#AAA] uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2F]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-[#666]">Loading requests...</td>
                                </tr>
                            ) : sortedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-[#666]">No requests found.</td>
                                </tr>
                            ) : (
                                sortedRequests.map((item, index) => (
                                    <motion.tr
                                        key={item.featureKey}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-[#222227] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-[#E5E5E5]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899]">
                                                    <Flag className="w-4 h-4" />
                                                </div>
                                                {formatFeatureName(item.featureKey)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-[#333] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#EC4899]"
                                                        style={{ width: `${Math.min((item.count / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-[#E5E5E5]">{item.count}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#AAA]">{formatDate(item.lastRequested)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#333] text-[#AAA]">
                                                Logged
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
