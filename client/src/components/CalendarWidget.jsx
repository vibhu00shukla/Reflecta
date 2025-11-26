import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture, isSameMonth, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CalendarWidget = ({ journals }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding days for the grid (start of week)
    const startDayOfWeek = monthStart.getDay(); // 0 (Sunday) to 6 (Saturday)
    const paddingDays = Array(startDayOfWeek).fill(null);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getDayStatus = (date) => {
        if (isFuture(date)) return 'future';

        const hasEntry = journals.some(journal =>
            isSameDay(new Date(journal.createdAt), date)
        );

        if (hasEntry) return 'posted';
        return 'missed';
    };

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        disabled={isFuture(addMonths(currentDate, 1)) && !isSameMonth(addMonths(currentDate, 1), new Date())}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-medium text-gray-400">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {paddingDays.map((_, idx) => (
                    <div key={`pad-${idx}`} className="aspect-square"></div>
                ))}

                {daysInMonth.map((date, idx) => {
                    const status = getDayStatus(date);
                    const isCurrentDay = isToday(date);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className="aspect-square flex flex-col items-center justify-center relative group cursor-default"
                        >
                            <span className={`text-sm ${isCurrentDay ? 'font-bold text-primary-600' : 'text-gray-700'}`}>
                                {format(date, 'd')}
                            </span>

                            {status === 'posted' && (
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            )}

                            {status === 'missed' && (
                                <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1 opacity-60"></div>
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
                                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg">
                                    {status === 'posted' ? 'Journaled' : status === 'missed' ? 'Missed' : 'Future'}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Journaled</span>
                </div>
                <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-400 opacity-60 mr-2"></div>
                    <span>Missed</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
