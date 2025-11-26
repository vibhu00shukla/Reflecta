import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BookOpen, Calendar, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CalendarWidget from '../components/CalendarWidget';

const Dashboard = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await axios.get('http://localhost:3000/journals');
                setJournals(res.data.items || []);
            } catch (error) {
                console.error("Failed to fetch journals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJournals();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen">
            <nav className="glass sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="bg-primary-100 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-primary-600" />
                            </div>
                            <span className="ml-3 text-xl font-bold text-gray-900 tracking-tight">Reflecta</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/settings"
                                className="text-gray-500 hover:text-primary-600 transition-colors"
                                title="Settings"
                            >
                                <SettingsIcon className="h-6 w-6" />
                            </Link>
                            <Link
                                to="/journal/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Journal</h1>
                    <p className="mt-2 text-gray-600">Capture your thoughts and let AI help you reflect.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Journal List */}
                        <div className="lg:col-span-2 space-y-6">
                            {journals.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20 glass-card rounded-2xl"
                                >
                                    <div className="bg-primary-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="h-8 w-8 text-primary-500" />
                                    </div>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No journals yet</h3>
                                    <p className="mt-1 text-gray-500 max-w-sm mx-auto">Start your journey of self-reflection by creating your first entry today.</p>
                                    <div className="mt-6">
                                        <Link
                                            to="/journal/new"
                                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create First Entry
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                                >
                                    {journals.map((journal) => (
                                        <motion.div key={journal._id} variants={item}>
                                            <Link
                                                to={`/journal/${journal._id}`}
                                                className="block h-full group"
                                            >
                                                <div className="glass-card rounded-xl h-full p-6 relative overflow-hidden group-hover:border-primary-300 transition-colors">
                                                    <div className="flex items-center text-xs font-medium text-primary-600 mb-3 bg-primary-50 w-fit px-2 py-1 rounded-md">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {new Date(journal.createdAt).toLocaleDateString(undefined, {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>

                                                    <p className="text-gray-900 text-base leading-relaxed line-clamp-3 mb-4 font-medium">
                                                        {journal.entryText}
                                                    </p>

                                                    {journal.analysis?.summary ? (
                                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">AI Insight</p>
                                                            <p className="text-sm text-gray-600 line-clamp-2 italic">"{journal.analysis.summary}"</p>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                                            <p className="text-xs text-gray-400 italic">Analysis pending...</p>
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                        <div className="bg-primary-100 p-1.5 rounded-full">
                                                            <ChevronRight className="h-4 w-4 text-primary-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar - Calendar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <CalendarWidget journals={journals} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
