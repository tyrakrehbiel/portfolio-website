import * as React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { Tooltip, Typography } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'; //will be used to display more in cell

import { useAppDispatch } from '../../store/hooks';
import { CellProps, Blob, EntryColor} from '../../@types/calendar';
import DayPreview from './day-preview/DayPreview';
import AddEntryMenu from '../../common/calendar-utils/add-entry-menu/AddEntryMenu';
import { numDaysInMonth, useSingleAndDoubleClick } from '../../common/calendar-utils/CalendarUtils';
import Draggable from './Draggable';

import './_CalendarGrid.scss';
import { SelectedDate } from '../../@types';
import { setDate } from '../../store/selectedDaySlice';

function getRenderStyle(numBlobs: number, blob: Blob){
    if (blob.hasGroup && blob.isTop) {
        return 'vertical';
    }else if(blob.hasGroup){
        return 'placeholder';
    }else if(numBlobs == 1){ 
        return 'horizontal';
    }else{
        return 'dot';
    }
}

const Cell = React.forwardRef((props : CellProps, ref: React.Ref<HTMLDivElement>) => {

    const {
        position, 
        blobs, 
        cellCapacity, 
        showWeekends,  
        today,
        hasPreviewOpen,
        isDragging,
        displayTitle, 
        setPreviewOpened, 
        addEntryToUser,
        updateCalendar, 
        onDragStart, 
        onDragEnd,
        getEntry,
        calendarLink,
    } = props

    const isValidDate = (position.dayIdx <= numDaysInMonth(position.monthIdx, position.yearIdx));
    const positionAsDate = new Date(position.yearIdx, position.monthIdx-1, position.dayIdx);
    const dateStr = new Intl.DateTimeFormat( 'en-US', {weekday: 'short', day: 'numeric'}).format(positionAsDate)
    const dispatch = useAppDispatch();

    const isToday = (
        today.getDate() == position.dayIdx
        && today.getMonth()+1 == position.monthIdx
        && today.getFullYear() == position.yearIdx
    )

    const isWeekend = (
        (positionAsDate.getDay() == 6 || positionAsDate.getDay() == 0) &&
        isValidDate &&
        showWeekends
    )

    const entryMenuAnchor = document.getElementById('cell-' + String(position.monthIdx) + '-' + String(position.dayIdx));

    // states
    const [showEntryMenu, setShowEntryMenu] = React.useState<boolean>(false);

    // toggles/handlers
    const toggleEntryMenu = () => {
        setShowEntryMenu(showEntryMenu ? false : true);
    }

    const setDaySelected = () => {
        const mm = String(position.monthIdx).padStart(2, '0');
        const dd = String(position.dayIdx).padStart(2, '0');
        const yyyy = String(position.yearIdx);
        const monthString = ( yyyy + '-' + mm + '-' + dd); 
        const newState: SelectedDate = {
            date: monthString
        }
        dispatch(setDate(newState));
    }

    const handlePrimaryClick = () => {
        if(!hasPreviewOpen && isValidDate && !isDragging){
            setDaySelected();
            toggleEntryMenu();
            handleClosePreview(); // close any other open previews on the screen
        }
    }

    const handleDoubleClick = () => {
        isValidDate && calendarLink('day', position.monthIdx, position.dayIdx);
    }

    const handleOpenPreview = () => {
        if(!isDragging){
            setDaySelected();
            setPreviewOpened(position);
        }   
    }

    const handleClosePreview = () => {
        setPreviewOpened(undefined);
    }

    /**
     * gives DayPreview the list of entries and their associted colors
     * @returns entries associated with each blob in the cell
     */
    function retrieveEntriesAndColors(){
        const entries: EntryColor[] = [];
        blobs.forEach((blob) => {
            const entry = getEntry(blob.entryId);
            entry && entries.push({entry, color: blob.color});
        })
        return entries;
    }

    function cellGridStyle(){
        if(blobs.length == 1 && !blobs.find((blob) => blob.hasGroup)){
            return 'one-entry ';
        }else{
            return 'mult-entry ';
        }
    }

    return(
        <motion.div>
            <AnimateSharedLayout>
                <motion.div
                    className= {
                        'drag-drop cell ' 
                        + cellGridStyle() 
                        + (isValidDate? 'active-cell ': 'invalid-cell ') 
                        + (isWeekend?  'weekend ' : '') 
                        + (isToday && 'today ') 
                    }
                    id={'cell-' + String(position.monthIdx) + '-' + String(position.dayIdx)}
                    ref={ref}
                    onClick={useSingleAndDoubleClick(handlePrimaryClick, handleDoubleClick)}
                    
                >
                    {blobs.map((blob, idx) => (
                        idx < cellCapacity && 
                        <Draggable 
                            key = {`blob-${blob.id}`}
                            id={blob.id}
                            blob={blob}
                            renderStyle={getRenderStyle(blobs.length, blob)}
                            displayTitle= {displayTitle}
                            isDragging = {isDragging}
                            onDragStart= {onDragStart}
                            onDragEnd = {onDragEnd}
                            getEntry={getEntry}
                            handleOpenPreview={handleOpenPreview}
                            handleClosePreview={handleClosePreview}
                        />
                    ))}
                    { blobs.length > cellCapacity &&
                        <Tooltip title={`+ ${blobs.length - cellCapacity}`}>
                            <MoreHorizIcon className={'more-indicator seat ' + cellCapacity} onClick={handleOpenPreview}/>
                        </Tooltip>
                    }
                    {isValidDate &&
                    <Typography className='cell-hover-text'>
                        {dateStr}
                    </Typography>
                    }
                </motion.div>
                <AddEntryMenu 
                    showEntryMenu={showEntryMenu} 
                    toggleEntryMenu={toggleEntryMenu}
                    entryMenuAnchorEl={entryMenuAnchor}
                    addEntryToUser={addEntryToUser}
                    updateCalendar={updateCalendar}
                />
                {hasPreviewOpen &&
                    <DayPreview
                        entryPreviews = {retrieveEntriesAndColors()}
                        position = {position} 
                        handleClosePreview={handleClosePreview}
                        addEntryToUser={addEntryToUser}
                        updateCalendar={updateCalendar}
                    />
                }
            </AnimateSharedLayout>
    
        </motion.div>
    )
});

Cell.displayName = 'Cell';

export default Cell;