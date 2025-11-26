import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BookOpen, Calendar } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Reflecta</span>
                        </div>
                        <div className="flex items-center">
                            <Link
                                to="/journal/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center py-10">Loading journals...</div>
                ) : journals.length === 0 ? (
                    <div className="text-center py-10">
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No journals yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new journal entry.</p>
                        <div className="mt-6">
                            <Link
                                to="/journal/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {journals.map((journal) => (
                            <Link
                                key={journal._id}
                                to={`/journal/${journal._id}`}
                                className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                            >
                                <div className="bg-white overflow-hidden shadow rounded-lg h-full border border-gray-200 hover:border-indigo-300">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(journal.createdAt).toLocaleDateString()}
                                        </div>
                                        <p className="text-gray-900 text-sm line-clamp-3">
                                            {journal.entryText}
                                        </p>
                                        {journal.analysis?.summary && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">AI Summary</p>
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{journal.analysis.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
