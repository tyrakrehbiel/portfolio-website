import * as React from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import { Typography } from '@material-ui/core';

import { DraggableProps } from '../../@types/calendar';
import { numDaysInMonth } from '../../common/calendar-utils/CalendarUtils';

import './_CalendarGrid.scss';

const getStyle = (renderStyle: string, color: string, length: number, dayIdx: number) => {
    const style = {
        height: '',
        backgroundColor: color,
        borderRadius: '',
    }
    const border = 11; // cell border causing heights to be off, calculate a border buffer to fix
    
    if (renderStyle == 'vertical' && length > 0) {
        style.height = (100+border) * length + '%';
    } else if (renderStyle == 'placeholder') {
        if (dayIdx==1) { // if placeholder is at the start of month (from month overflow), style like vertical
            style.height = (100+border) * length + '%';
            style.borderRadius = '8px';
        } else {
            style.backgroundColor = 'transparent';
        }       
    }
    return style;
}

const Draggable: React.FC<DraggableProps>  = props => {
    const { id, blob, renderStyle, isDragging, onDragStart, onDragEnd, displayTitle , getEntry, handleOpenPreview, handleClosePreview } = props;
    const entry = getEntry(blob.entryId);

    const numValidDays = numDaysInMonth(blob.position.monthIdx, blob.position.yearIdx) - blob.position.dayIdx + 1; // days available to place blobs in (valid days of month)
    const length = // limit vertical length to number of valid days in the month
        renderStyle == 'vertical' 
            ? Math.min(numValidDays, blob.duration)
            : blob.duration;

    const draggableStyle = entry && getStyle(renderStyle, blob.color, length, blob.position.dayIdx);
    
    const assignedSeat = ' seat' + (blob.seatNumber + 1); // place blob in cell based on its seatNumber - edge case: duplicate seat numbers

    return(
        <AnimatePresence>
            <motion.div
                id={'draggable-' + id}
                className={'draggable ' + renderStyle + assignedSeat}
                style={draggableStyle}
                drag={blob.isTop || blob.position.dayIdx==1}
                initial={false}
                dragMomentum={false}
                dragElastic={1}
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0}}
                onDrag={handleClosePreview}
                onClick={handleOpenPreview}
                onDragStart={ () => onDragStart(blob.position.yearIdx, blob.position.monthIdx, blob.position.dayIdx)}
                onDragEnd={ (_, info) => entry && onDragEnd(_, info, entry)}
            >
                {entry && displayTitle(blob.entryId) && renderStyle == 'horizontal' && 
                    (
                        <Typography className='entry-titles'>
                            { entry.title }
                        </Typography>
                    )
                }
            </motion.div>
        </AnimatePresence>
    )
}

export default Draggable;