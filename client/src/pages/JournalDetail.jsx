import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, Calendar, Brain, Lightbulb } from 'lucide-react';

const JournalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const journalRes = await axios.get(`http://localhost:3000/journals/${id}`);
                setJournal(journalRes.data.journal);

                // Try to fetch analysis if it exists
                try {
                    const analysisRes = await axios.get(`http://localhost:3000/cbt/journal/${id}`);
                    setAnalysis(analysisRes.data.analysis);
                } catch (err) {
                    console.log("No analysis found or error fetching it", err);
                }

            } catch (error) {
                console.error("Failed to fetch journal details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this journal?")) {
            try {
                await axios.delete(`http://localhost:3000/journals/${id}`);
                navigate('/');
            } catch (error) {
                console.error("Failed to delete journal", error);
                alert("Failed to delete journal");
            }
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!journal) return <div className="text-center py-10">Journal not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center">
                            <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                                title="Delete Journal"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Journal Content */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Journal Entry
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(journal.createdAt).toLocaleDateString()} {new Date(journal.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <p className="text-gray-900 whitespace-pre-wrap text-lg leading-relaxed">
                            {journal.entryText}
                        </p>
                        {journal.moodScore && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                Mood: {journal.moodScore}/10
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Analysis */}
                {analysis ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-indigo-500">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-indigo-50">
                            <div className="flex items-center">
                                <Brain className="h-6 w-6 text-indigo-600 mr-2" />
                                <h3 className="text-lg leading-6 font-medium text-indigo-900">
                                    AI Analysis & Insights
                                </h3>
                            </div>
                        </div>
                        <div className="px-4 py-5 sm:p-6 space-y-6">

                            {/* Emotions */}
                            {analysis.emotions && analysis.emotions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Detected Emotions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.emotions.map((emotion, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {emotion}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Negative Thoughts */}
                            {analysis.negativeThoughts && analysis.negativeThoughts.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Negative Thoughts Identified</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                        {analysis.negativeThoughts.map((thought, idx) => (
                                            <li key={idx}>{thought}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Distortions */}
                            {analysis.distortions && analysis.distortions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Cognitive Distortions</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                        {analysis.distortions.map((distortion, idx) => (
                                            <li key={idx}>{distortion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Reframes */}
                            {analysis.reframes && analysis.reframes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                                        Suggested Reframes
                                    </h4>
                                    <div className="space-y-4">
                                        {analysis.reframes.map((reframe, idx) => (
                                            <div key={idx} className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                                                <p className="text-sm text-gray-600 mb-1 font-medium">Original: "{reframe.originalThought}"</p>
                                                <p className="text-base text-gray-900 font-semibold">Reframe: "{reframe.rationalResponse}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <Brain className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                            Analysis pending...
                        </span>
                        <p className="mt-1 text-sm text-gray-500">Check back in a moment for AI insights.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default JournalDetail;
