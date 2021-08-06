import * as React from 'react';
import { motion } from 'framer-motion';
import { Paper } from '@material-ui/core';

import { MONTHS } from '../../common/calendar-utils/CalendarUtils';

import './_CalendarGrid.scss';

interface Props {
    currentYear: number,
    today: Date,
    calendarLink: (type: 'month' | 'day', month: number, day?: number) => void
}

const MonthHeader: React.FC<Props> = ({currentYear, today, calendarLink}: Props) => {

    const isCurrentYear = today.getFullYear() == currentYear;

    return (
        <Paper elevation={5} className='month-header-bar' >
            {MONTHS.map((month) => (
                <motion.div
                    className='month-names-div'
                    key = {month.name}
                    onClick={() => calendarLink('month', month.id + 1)}
                > 
                    <motion.span className = {'month-span ' +  'full-month ' + (isCurrentYear && month.id == today.getMonth()  && 'current-month')}> 
                        {month.name}
                    </motion.span>
                    <motion.span className = {'month-span ' +  'short-month ' +  (isCurrentYear && month.id == today.getMonth() && 'current-month' )}> 
                        {month.name.slice(0,3)}
                    </motion.span>
                    <motion.span className = {'month-span ' +  'single-char ' +  (isCurrentYear && month.id == today.getMonth() && 'current-month' )}> 
                        {month.id + 1}
                    </motion.span>
                </motion.div>
            ))}
        </Paper>
    )
}

export default MonthHeader;
