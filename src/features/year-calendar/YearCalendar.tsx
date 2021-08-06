import * as React from 'react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { 
    Grid,
    Typography,
} from '@material-ui/core';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDate } from '../../store/selectedDaySlice';

import { getDateTimeStr, getEntryDuration, getTagColor, getTodayString, getYearEntries, isLeapYear, MONTHS, numDaysInMonth } from '../../common/calendar-utils/CalendarUtils';

import { Entry, SelectedDate, Tag } from '../../@types/index';
import { Blob, CellPosition, DayCell, MonthColumn } from '../../@types/calendar';

import { updateEntry, getEntryById } from '../../axios/entries';
import { addUserEntry } from '../../axios/user';

import ActionBar from '../../common/calendar-utils/action-bar/ActionBar';
import Cell from './Cell';
import MonthHeader from './MonthHeader';

import EditErrorBar from '../../common/snackbars/EditErrorBar';

import './_CalendarGrid.scss';

const NUM_MONTHS = 12;
const NUM_DAYS = 31;

const YearCalendar: React.FC = () => {

    const dispatch = useAppDispatch();
    //const selectedDate = useAppSelector(store => store.selectedDate.date);
    const userId = useAppSelector(store => store.user.user.id);
    const today = new Date();
    const history = useHistory();

    // STATE TOGGLES
    const [focusCellPos, setFocusCellPos] = React.useState<CellPosition>({yearIdx: 0, monthIdx: 0, dayIdx: 0});
    const [currentYear, setCurrentYear] = React.useState<number>(today.getFullYear());
    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [filteredEntries, setFilteredEntries] = React.useState<Entry[]>([]);
    const [blobs, setBlobs] = React.useState<Blob[]>([]);
    const [showAllTitles, setShowAllTitles] = React.useState<boolean>(true);
    const [showTitlesByTag, setShowTitlesByTag] = React.useState<number []>([]);
    const [showTitlesByType, setShowTitlesByType] = React.useState<string []>([]);
    const [showWeekends, setShowWeekends] = React.useState<boolean>(true);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [dayPreviewOpened, setDayPreviewOpened ] = React.useState<CellPosition | undefined>();
    const [entryAdded, toggleEntryAdded] = React.useState<boolean>(false); // should update
    const [cellCapacity, setCellCapcity] = React.useState<number>(5);
    // edit permissions
    const [showEditErrorBar, setShowEditErrorBar] = React.useState(false);

    // CREATE CALENDAR -- for each month, generate a set of 31 cell references 
    const dates: number [] = Array.from({length: NUM_DAYS}, (item, index) => index);
    const monthColumns: MonthColumn[] = [];
    for(let month = 1; month <= NUM_MONTHS; month++) {
        const dayCells: DayCell[] = [];
        for (let day = 1 ; day <= NUM_DAYS; day++) {
            const ref = React.useRef(null);
            const position = {
                yearIdx: currentYear, 
                monthIdx: month, 
                dayIdx: day,
            }
            dayCells.push(({ref, position}));
        }
        monthColumns.push({monthId: month, dayCells});
    }

    // GET ENTRIES AND BLOBS
    React.useEffect(() => {
        (async () => {
            // get entries from the store or api
            if (userId) {
                const tempEntries = await getYearEntries(userId.toString(), currentYear.toString());
                
                setEntries([...tempEntries]);
                setFilteredEntries([...tempEntries]);
                updateCellCapacity();

                //set the store date to be today (if currentYear) or the first of the year -- following pattern of year, week, and day calendar
                if(currentYear == today.getFullYear()){
                    const newState: SelectedDate = {
                        date: getTodayString(),
                    }
                    dispatch(setDate(newState));//set date to today
                }else{
                    const firstDate = new Date(currentYear, 0, 1); //get first date of the year
                    const newState: SelectedDate = {
                        date: firstDate.toISOString(),  
                    }
                    dispatch(setDate(newState)); //set date to first of the year
                }
            }
        })()
    }, [userId, currentYear]) 
    /*
        Create blobs for every entry

        Blob = a visible, draggable representation of an entry on the calendar

        Parent blob = 
        - the first blob of a group, located at the start date for the entry
        - every entry has a parent blob

        Placeholder blob = 
        - only long entries (entries occuring over multiple days) have placeholder blobs
        - is part of a group with only a single parent blob
    */  
    React.useEffect(() => {
        (async () => {
            if (userId) {
                let blobId = 0; // counter for creating blob IDs
                const buildBlobs: Blob[] = [];
                
                for (const entry of filteredEntries) { // create blobs for every entry
                    if (entry.id) {
                        const start = new Date(entry.startDateTime);
                        const end = new Date(entry.endDateTime);
                        const duration = getEntryDuration(start, end);
                        const color = await getTagColor(entry.tagIds, entry.primaryTagId);

                        const startMonth = start.getMonth()+1; // months are 1-indexed
                        const endMonth = end.getMonth()+1; // months are 1-indexed

                        const startYear = start.getFullYear();
                        const endYear = end.getFullYear();

                        const startDate = start.getDate();
                        const endDate = end.getDate();
                        
                        buildBlobs.push({ // create parent blob for every entry
                            id: blobId, 
                            entryId: entry.id, 
                            position: {
                                yearIdx: startYear,
                                monthIdx: startMonth, 
                                dayIdx: startDate,
                            },
                            seatNumber: 0,
                            duration: duration,
                            color: color,
                            hasGroup: duration > 1 ? true : false,
                            isTop: true,
                        });
                        blobId++;

                        if (duration > 1) { // create placeholder blobs for long entries (occuring over multiple days)
                            if (startYear == endYear) { // if entry occurs in single year
                                if (startMonth == endMonth) { // if entry occurs in single month
                                    for (let d=1; d<=duration; d++) { // create consecutive placeholder blobs
                                        buildBlobs.push({
                                            id: blobId,
                                            entryId: entry.id,
                                            position: {
                                                yearIdx: startYear,
                                                monthIdx: startMonth,
                                                dayIdx: startDate+d,
                                            },
                                            seatNumber: 0,
                                            duration: 1,
                                            color: color,
                                            hasGroup: true,
                                            isTop: false
                                        });
                                        blobId++;   
                                    }
                                } else { // if entry occurs within over multiple months
                                    const durationStartMonth = numDaysInMonth(startMonth, startYear) - startDate;
                                    for (let d=1; d<=durationStartMonth; d++) { // create first month placeholder blobs
                                        buildBlobs.push({
                                            id: blobId,
                                            entryId: entry.id,
                                            position: {
                                                yearIdx: startYear,
                                                monthIdx: startMonth,
                                                dayIdx: startDate+d,
                                            },
                                            seatNumber: 0,
                                            duration: 1,
                                            color: color,
                                            hasGroup: true,
                                            isTop: false
                                        });
                                        blobId++;   
                                    }

                                    const numMonths = endMonth - startMonth;
                                    for (let m=1; m<numMonths; m++) { // create middle month(s) placeholder blobs
                                        const numDays = numDaysInMonth(startMonth+m,startYear)
                                        for (let d=1; d<=numDays; d++) {
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: startYear,
                                                    monthIdx: startMonth+m,
                                                    dayIdx: d,
                                                },
                                                seatNumber: 0,
                                                duration: d==1 ? numDays : 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++;   
                                        }
                                    }

                                    for (let d=1; d<=endDate; d++) { // create end month placeholder blobs
                                        buildBlobs.push({
                                            id: blobId,
                                            entryId: entry.id,
                                            position: {
                                                yearIdx: startYear,
                                                monthIdx: endMonth,
                                                dayIdx: d,
                                            },
                                            seatNumber: 0,
                                            duration: d==1 ? endDate : 1,
                                            color: color,
                                            hasGroup: true,
                                            isTop: false
                                        });
                                        blobId++;
                                    }
                                }
                            } else { // if entry occurs over multiple years
                                const numMonths = 12 - startMonth + 1;
                                for (let m=0; m<numMonths; m++) { // create start year placeholder blobs
                                    if (m==0) { // if start month of entry, create consecutive placeholders
                                        const numDays = numDaysInMonth(startMonth, startYear) - startDate;
                                        for (let d=1; d<=numDays; d++) {
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: startYear,
                                                    monthIdx: startMonth,
                                                    dayIdx: startDate+d,
                                                },
                                                seatNumber: 0,
                                                duration: 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++; 
                                        }
                                    } else { // if any other month of start year, create dots for every day in that month
                                        const numDays = numDaysInMonth(startMonth+m, startYear);
                                        for (let d=1; d<=numDays; d++) { 
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: startYear,
                                                    monthIdx: startMonth,
                                                    dayIdx: startDate+d,
                                                },
                                                seatNumber: 0,
                                                duration: 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++; 
                                        }
                                    }
                                }

                                const numYears = endYear - startYear;
                                for (let y=1; y<numYears; y++) { // create middle year(s) placeholder blobs
                                    for (let m=1; m<=12; m++) {
                                        const numDays = numDaysInMonth(m,startYear+y)
                                        for (let d=1; d<=numDays; d++) {
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: startYear + y,
                                                    monthIdx: m,
                                                    dayIdx: d,
                                                },
                                                seatNumber: 0,
                                                duration: d==1 ? numDays : 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++;
                                        }
                                    }
                                }

                                for (let m=1; m<=endMonth; m++) { // create end year placeholder blobs
                                    if (m==endMonth) { // if end month of entry, create consecutive placeholders
                                        for (let d=1; d<=endDate; d++) {
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: endYear,
                                                    monthIdx: endMonth,
                                                    dayIdx: d,
                                                },
                                                seatNumber: 0,
                                                duration: d==1 ? endDate : 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++; 
                                        }
                                    } else { // if any other month of end year, create dots for every day in that month
                                        const numDays = numDaysInMonth(m,endYear);
                                        for (let d=1; d<=numDays; d++) {
                                            buildBlobs.push({
                                                id: blobId,
                                                entryId: entry.id,
                                                position: {
                                                    yearIdx: endYear,
                                                    monthIdx: m,
                                                    dayIdx: d,
                                                },
                                                seatNumber: 0,
                                                duration: d==1 ? numDays : 1,
                                                color: color,
                                                hasGroup: true,
                                                isTop: false
                                            });
                                            blobId++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                setBlobs(assignBlobSeats(buildBlobs));
            }
        })()
    }, [filteredEntries])

    //Determine cell capacity based on changes to window size
    React.useEffect(() => {
        const resizeListener = () => {
            // prevent execution of previous setTimeout
            clearTimeout();
            // update capcity from the state object after 150 milliseconds
            setTimeout(() => updateCellCapacity(), 150);
        };
        // set resize listener
        window.addEventListener('resize', resizeListener);

        // clean up function
        return () => {
        // remove resize listener
            window.removeEventListener('resize', resizeListener);
        }
    }, [])

    React.useEffect(() => {

        const delta = 6;
        let startX : number;
        let startY: number;

        document.addEventListener('mousedown', function (event) {
            startX = event.pageX;
            startY = event.pageY;
           
        });
        document.addEventListener('mouseup', function (event) {
            const diffX = Math.abs(event.pageX - startX);
            const diffY = Math.abs(event.pageY - startY);

            if (diffX < delta && diffY < delta){
                setIsDragging(false)
            }else{
                setIsDragging(true)
            }
        });
        /*
        return () => {
            document.removeEventListener('mousedown');
            document.removeEventListener('mousemove'); 
        }*/
    })

    /** 
     * Instead of sorting and placing blobs in seats when pulling blob [] for a cell, sort and place them beforehand
     * blobs are initially sorted by time based on the other blobs in the cell, when we call getBlobs - we will determine if any seats
     * must change for the blob groups to stay together
     * @param createdBlobs 
     * @returns 
     */
    function assignBlobSeats(createdBlobs: Blob[] ){
        let allBlobs: Blob [] = []
        for (let month = 1; month <= NUM_MONTHS; month++) {
            for(let day = 1; day <= NUM_DAYS; day ++) { // 0, <
                const seatedBlobs: Blob[] = [];
                const standingBlobs = createdBlobs.filter(blob => blob.position.monthIdx  ==  month && blob.position.dayIdx == day); //need to account for year

                standingBlobs.sort((a,b) => {

                    const aEntry = getEntry(a.entryId);
                    const bEntry = getEntry(b.entryId);

                    if(aEntry && bEntry){ //check if entries are defined
                        const aDate = new Date(aEntry.startDateTime)
                        const bDate = new Date(bEntry.startDateTime)
                        const aTime = {hour: aDate.getHours(), min: aDate.getMinutes()}
                        const bTime = {hour: bDate.getHours(), min: bDate.getMinutes()}

                        if (aTime.hour < bTime.hour){
                            return -1;
                        }else if (aTime.hour == bTime.hour){
                            if(aTime.min < bTime.min){
                                return -1;
                            }
                        }
                    }
                    return 1;
                })
                
                standingBlobs.forEach((blob, idx) => {
                    blob.seatNumber = idx;
                    seatedBlobs.push(blob);
                })
                allBlobs = allBlobs.concat(seatedBlobs);
            }  
        }
        return allBlobs;
    }

    /** 
     * 
     * gets the first possible seat where the entire blob group can sit together. If there is only one blob in the group, use it's initial seat number
     * 
     * @param entryId 
     * @returns seatNumber that is the maximum in the vertical bar group
     */
    function getMaxSeatByEntryId(entryId: number){
        //get all blobs with the same entry id -- (note for reoccuring events with same id - will need to distinguish) and sort by the day
        const blobGroup = blobs.filter(blob => blob.entryId == entryId).sort((a, b) => (a.position.dayIdx < b.position.dayIdx ? -1 : 1));
        let maxSeat = blobGroup? blobGroup[0].seatNumber : 0;

        blobGroup.forEach((blob) => {
            if (blob.seatNumber > maxSeat) {
                maxSeat = blob.seatNumber
            }
        })
        return maxSeat;
    }

    /** 
     * returns the entry in the entries with sepcified id 
     * @param id 
     * @returns entry with param id
     */
    function getEntry(id: number){
        return entries.find(entry => entry.id == id);
    }
    
    /** 
     * determines if element contains a point
     * 
     * @param element cell's current reference
     * @param x 
     * @param y 
     * @returns true if x and y coordinates fall withing the current cell's reference area
     */
    function containsPoint(element: any, x: any, y: any) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= y && y <= rect.bottom && rect.left <= x && x <= rect.right) {
            return true;
        } else {
            return false;
        }
    }

    // let callCounter = 0;
    /** 
    *  retrieves all blobs for the cell and determines their seat placements based on other cell blob counts
    * 
    * @param month cell column
    * @param day cell row
    * @returns blobs with the corresponding month and day index
    */
    const getBlobsByCell = (year: number, month: number, day: number) => { 
        const cellContents = blobs.filter(blob => blob.position.yearIdx  ==  year && blob.position.monthIdx  ==  month && blob.position.dayIdx == day);
        const seats = [0,0,0,0,0]; //change this to reflect dynamic changes- this should be an array of 0's for the number of blobs not set at 5
        cellContents.forEach((blob) => {
            if(blob.hasGroup){
                blob.seatNumber = getMaxSeatByEntryId(blob.entryId);
            }
            seats[blob.seatNumber] +=1;
        })
            
        //if a blob has the same seat number, grant it the next avaliable seat
        cellContents.forEach((blob) => {
            if(!blob.hasGroup && seats[blob.seatNumber] > 1){
                const nextAvaliable = seats.findIndex((occupant, index) => (occupant == 0 && index > blob.seatNumber))
                if (nextAvaliable) blob.seatNumber = nextAvaliable
            }
        })
    
        return cellContents;
    }
    
    /**
     * Determines the targetCell associated with the endDrag location. If a valid location isn't found, returns the previous cell location
     * @param _ 
     * @param info mouse endDrag location
     * @returns new targetCell associated the endDrag location otherwise, the cell draggable previously resided 
     */
    const getActiveCellIndex = (_:any, info: any) => {
        const targetCellPos: CellPosition = focusCellPos;
        monthColumns.forEach((month) => {
            for(const day of month.dayCells){
                if (containsPoint(day.ref.current, info.point.x, info.point.y)){
                    if (day.position.dayIdx < numDaysInMonth(targetCellPos.monthIdx, targetCellPos.yearIdx)) {
                        targetCellPos.dayIdx = day.position.dayIdx;
                        targetCellPos.monthIdx = day.position.monthIdx;
                        targetCellPos.yearIdx = day.position.yearIdx;
                    }
                    break; //cell found 
                }
            }
        })
        return targetCellPos;
    }
    
    /** 
     * 
     * sets the draggable's previous location to use if dragEnd location is not a valid cell
     * 
     * @param monthIdx 
     * @param dayIdx 
     */
    const onDragStart = (yearIdx: number, monthIdx: number, dayIdx: number) => {
        setFocusCellPos({yearIdx, monthIdx, dayIdx}); 
    }

    /**  
     * determines new cell for the draggable, 
     * updates the entry associated with the moved draggable, 
     * updates the entries state
     * 
     * @param _ 
     * @param info 
     * @param event -- will probably change to eventId
     */
    const onDragEnd = (_:any, info: any, entry: Entry) => {
        const targetCellPos = getActiveCellIndex(_, info);
        setFocusCellPos(targetCellPos);

        const start = new Date(entry.startDateTime);
        const end = new Date(entry.endDateTime);

        const duration = getEntryDuration(start,end);

        console.log('entry '+entry.id+' - duration '+duration)
        const newStartDate = new Date(targetCellPos.yearIdx, targetCellPos.monthIdx-1, targetCellPos.dayIdx, start.getHours(), start.getMinutes());
        // in end date: need -1 to calculate the proper index because duration is an inclusive number
        const newEndDate = new Date(targetCellPos.yearIdx, targetCellPos.monthIdx-1, targetCellPos.dayIdx + duration - 1, end.getHours(), end.getMinutes()); 

        entry.id && getEntryById(entry.id).then(res => {
            const tempEntry: Entry = res.data;

            tempEntry.startDateTime =  getDateTimeStr(newStartDate);
            tempEntry.endDateTime = getDateTimeStr(newEndDate);

            updateEntry(tempEntry).catch((err) => {
                setShowEditErrorBar(true);
                // revert dnd
                tempEntry.startDateTime =  start.toISOString();
                tempEntry.endDateTime = end.toISOString();
                setEntries([...(entries.filter(current => current.id  != entry.id)), tempEntry])
                setFilteredEntries([...(entries.filter(current => current.id  != entry.id)), tempEntry])
            });
            setEntries([...(entries.filter(current => current.id  != entry.id)), tempEntry])
            setFilteredEntries([...(entries.filter(current => current.id  != entry.id)), tempEntry])
        })
    }

    /**
     * links to month or day calendar views based the type specified and the given month and day
     * @param type month or day , determines if it will link to the day view or month view
     * @param month 
     * @param day 
     */
    const calendarLink = (type: 'month' | 'day', month: number, day?: number) => {
        const mm = String(month).padStart(2, '0');
        const dd = day? String(day).padStart(2, '0') : '01'
        const yyyy = currentYear
        const monthString = ( yyyy + '-' + mm + '-' + dd);
        const newState: SelectedDate = {
            date: monthString
        }
        dispatch(setDate(newState));
        history.push('/' + type)
    }

    /** 
     * one of the function forcreateEventModal
     * 
     * @param entryId 
     * @returns 
     */
    const addEntryToUser = (entryId: number) => {
        return addUserEntry(Number(userId), entryId);
    }
    /**
     * tells the calendar to update after a journal is created.
     * Note, createEventModal uses addEntryToUser but createJournalModal uses its own function so
     * the year calendar does not know to update
     */
    const updateCalendar = (newEntry: Entry) => {
        setEntries(prev => [...prev, newEntry])
        setFilteredEntries(prev => [...prev, newEntry])
    }   
    
    /**
     * handles next year button clicks, increments currentYear
     */
    const handleNextYear = () => {
        setCurrentYear(currentYear+1);
    }

    /**
     * handles previous year button clicks, decrements currentYear
     */
    const handlePrevYear = () => {
        setCurrentYear(currentYear - 1);
    }

    /**
     * sets the current year back to the current date
     */
    const handleToday = () => {
        setCurrentYear(today.getFullYear());
    }

    /**
     * 
     * @param types list of types to display
     * @param tagList list of tags to display
     */
    const applyFilters = (types:string[], tagList:Tag[]) =>  {
        const sortedEntries: Entry [] = [];
        // Filter out the ones that are not the specified type
        
        entries.forEach((entry) => {
            if (types.includes(entry.entryType)){
                sortedEntries.push(entry);
            }
        })
        //filter out any entry who does not have a tag in the list
        const tagListIds = tagList.map((tag) => tag.id);
        const tempEntries: Entry [] = [];
        for (const entry of sortedEntries){
            if(entry.tagIds.length != 0){
                for (const id of entry.tagIds){
                    if (tagListIds.includes(id)){
                        tempEntries.push(entry);
                        break;
                    }
                }
            }else{
                tempEntries.push(entry); //if an entry does not have a tag to filter in or out, leave in?
            }
        }

        setFilteredEntries(tempEntries);
    }

    const applyTitleToggles = (showAll: boolean, types?: string[], tagIds?: number[], ) => {
        setShowAllTitles(showAll);
 
        if(types && tagIds){
            setShowTitlesByType(types);
            setShowTitlesByTag(tagIds);
        }
       
    }

    const displayTitle = (entryId: number) => {
        if(showAllTitles){
            return true;
        }
        const entry = getEntry(entryId);
        if(entry){
            if( showTitlesByType.includes(entry.entryType)){
                return true;
            }else{
                for (const tagId of entry.tagIds){
                    if (showTitlesByTag.includes(tagId)){
                        return true;
                    }
                }
            }     
        }
        return false;
    }

    /**
     * sets dayPreviewOpened to be the cell that has the preview open,
     * if a cell calls this function with undefined, its day preview was closed
     * @param cell cell (day) that opened the preview
     */
    function togglePreviewOpen (cell: CellPosition | undefined){
        setDayPreviewOpened(cell);
    }

    function toggleWeekend (show: boolean){
        setShowWeekends(show);
    }

    const getWindowWidth = () => window.innerWidth 
    || document.documentElement.clientWidth 
    || document.body.clientWidth;

    /**
     * limits cell capacity to screen sizes
     */
    const updateCellCapacity = () => {
        const windowWidth = getWindowWidth();
        if (windowWidth){
            if (windowWidth <= 900){
                setCellCapcity(1);
            }else if (windowWidth <= 1100){
                setCellCapcity(2);
            }else if (windowWidth <= 1500){
                setCellCapcity(3)
            }else if (windowWidth <= 1600){
                setCellCapcity(4)
            }else {
                setCellCapcity(5)
            }
        }
    }

    /**
     * 
     * @returns calendar dates as side bar
     */
    function CalendarDates (){
        return(
            <Grid className='calendar-dates'>          
                {dates.map((num) => (
                    <Typography className='date-typography' key={`date-id-${num}`} >
                        {`${num + 1}`}
                    </Typography>
                ))}
            </Grid>
        )
    }
    
    return (
        <motion.div 
            className='drag-drop root-div'
            initial={{opacity: 0}}
            animate={{opacity: 1.0}}
            transition={{duration: 0.5, delayChildren: .5}}
        >          
            <Grid container className='year-container' direction= 'row'>
                <ActionBar 
                    currentYear={currentYear} 
                    addEntryToUser={addEntryToUser}
                    updateCalendar={updateCalendar}
                    handleNextYear={handleNextYear} 
                    handlePrevYear={handlePrevYear} 
                    handleToday={handleToday}
                    applyFilters={applyFilters}
                    applyTitleToggles={applyTitleToggles}
                    toggleWeekendOnView={toggleWeekend}
                />
                <Grid item xs={11}>
                    <MonthHeader currentYear={currentYear} today={today} calendarLink={calendarLink}/>
                </Grid>
                <Grid className='year-grid' item xs = {11}>
                    <CalendarDates/>
                    {MONTHS.map((month, mIdx) => (
                        <Grid
                            id = {String(mIdx)}
                            key = {`month-${mIdx}`}
                            item
                            xs={1}
                            className={'month-grid ' + (mIdx % 2 == 0? 'alt-color': '' )}
                        >
                            {(monthColumns[mIdx].dayCells).map((day, idx) => (                           
                                <Cell
                                    key = {`cell-month-${day.position.monthIdx}day-${day.position.dayIdx}`}
                                    position = {{yearIdx: currentYear, monthIdx: day.position.monthIdx, dayIdx: day.position.dayIdx}} // update year index
                                    blobs = {getBlobsByCell(day.position.yearIdx, day.position.monthIdx, day.position.dayIdx)}
                                    cellCapacity = {cellCapacity}
                                    showWeekends={showWeekends}
                                    ref={day.ref}
                                    today={today}
                                    isDragging={isDragging}
                                    onDragStart = {onDragStart}
                                    onDragEnd = {onDragEnd}
                                    getEntry = {getEntry}
                                    displayTitle={displayTitle}
                                    calendarLink = {calendarLink}
                                    addEntryToUser={addEntryToUser}
                                    updateCalendar={updateCalendar}
                                    hasPreviewOpen={ // only allow one day preview to be open at a time
                                        dayPreviewOpened?.yearIdx == currentYear &&
                                        dayPreviewOpened?.monthIdx == day.position.monthIdx &&
                                        dayPreviewOpened?.dayIdx == day.position.dayIdx }
                                    setPreviewOpened = {togglePreviewOpen}
                                />
                            ))}
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <EditErrorBar open={showEditErrorBar} setShowEditErrorBar={setShowEditErrorBar}/>
        </motion.div>
    )
}

export default YearCalendar;