import React from 'react';
import FullCalendar, { DatesSetArg, EventApi, ViewMountArg, ViewApi, EventClickArg, EventDropArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import Drawer from './DisplayDrawer';
import { useHistory } from 'react-router-dom';
import {
    createStyles,
    makeStyles,
} from '@material-ui/core/styles';
import clsx from 'clsx';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDate } from '../../store/selectedDaySlice';
import { Entry, CalendarEntry, SelectedDate, Tag } from '../../@types';
import { updateEntry, getEntryById, getByBetweenDateTime } from '../../axios/entries';
import { addUserEntry } from '../../axios/user';
import { Typography, Fab, Grid } from '@material-ui/core';
import { eventToCalEvent, fixDateFormat, fixTimeFormat, isBetweenDates, isTodayInView, getTodayString } from '../../common/calendar-utils/CalendarUtils';
import ActionBarFC from '../../common/calendar-utils/action-bar/ActionBarFC';
import './_MonthCalendar.scss';
import AddEntryMenu from '../../common/calendar-utils/add-entry-menu/AddEntryMenu';
import $ from 'jquery';
import { DateRange } from '../../@types/calendar';
import EditErrorBar from '../../common/snackbars/EditErrorBar';

const useStyles = makeStyles(() =>
    createStyles({
        content: {
            flexGrow: 1,
            // padding: theme.spacing(3),
            marginRight: 0,
        },
        contentShift: {
            marginRight: 370,
        },
    }),
);

const MonthCalendar: React.FC = () => {
    // STATES FOR FULLCALENDAR
    const [viewApi, setViewApi] = React.useState<ViewApi>(); // ViewApi object for fullcalendar
    const [entries, setEntries] = React.useState<CalendarEntry[]>([]); // Entries array that should never have filters applied
    const [filteredEntries, setFilteredEntries] = React.useState<CalendarEntry[]>([]); // A copy of the entries array to apply filters to, and the actual list that fullcal renders events from
    const [selectedEvents, setSelectedEvents] = React.useState<CalendarEntry[]>([]); // Events that are to be shown on the display drawer
    const [selectedDay, setSelectedDay] = React.useState<Date>(new Date()); // Date to be shown on the display drawer
    const [dateRange, setDateRange] = React.useState<DateRange>(); // Range of dates to render events for
    const [updateOnViewChange, setUpdateOnViewChange] = React.useState<boolean>(false); // Used to tell the TagMenuFilter when to re-render
    // STATES FOR HANDLING OTHER COMPONENTS
    const [openEntryMenu, setOpenEntryMenu] = React.useState<boolean>(false);
    const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);
    const [entryMenuAnchor, setEntryMenuAnchor] = React.useState<HTMLButtonElement | HTMLElement | null>(null);
    const [entryMenuCoords, setEntryMenuCoords] = React.useState<number[]>([0, 0]);
    // REDUX
    const dispatch = useAppDispatch();
    const userId = useAppSelector(store => store.user.user.id);
    const startDate = useAppSelector(store => store.selectedDate.date);
    // HISTORY AND STYLES
    const history = useHistory();
    const classes = useStyles();

    // Edit permissions
    const [showEditErrorBar, setShowEditErrorBar] = React.useState(false);

    // HOOKS

    // Get entries for the set range of dates
    React.useEffect(() => {
        
        const firstDate = new Date(startDate);

        (async () => {
            const userEvents: CalendarEntry[] = [];
            if (userId) {
                // set initial range
                const startRange = new Date(firstDate.getFullYear(), firstDate.getMonth() - 6, 1);
                const endRange = new Date(firstDate.getFullYear(), firstDate.getMonth() + 6, 1);
                setDateRange({ 'start': startRange, 'end': endRange });

                // get entries for the month and convert to CalendarEntries
                const res = await getByBetweenDateTime(startRange.toISOString(), endRange.toISOString(), userId.toString());
                const entryResult: Entry[] = res.data
                if (entryResult) {
                    await Promise.all(entryResult.map(async (entry: Entry) => {
                        const calEvent = await eventToCalEvent(entry);
                        userEvents.push(calEvent);
                    }));
                }
                // add to list of rendered months
                setEntries([...entries, ...userEvents]);
                setFilteredEntries([...entries, ...userEvents]);

                //YYYY-MM-DD
                const time = firstDate.getFullYear() + '-' + String(firstDate.getMonth() + 1).padStart(2, '0') + '-' + String(firstDate.getDate()).padStart(2, '0');
                setSelectedEvents(userEvents.filter((entry) => entry.start.includes(time)));
                setUpdateOnViewChange(!updateOnViewChange);
            }
        })()
    }, [userId])

    // AXIOS / PROMISES

    /**
     * Makes backend call to add the specified entry to the logged in user
     * 
     * @param entryId id of the entry to be added to the user
     */
    const addEntryToUser = (entryId: number) => {
        return addUserEntry(Number(userId), entryId).then(async (res) => {
            const newEntry = await eventToCalEvent(res.data);
            setEntries(prev => [...prev, newEntry]);
            setFilteredEntries(prev => [...prev, newEntry]);
        });
    }

    /**
     * Updates the entry in the backend after drag-and-drop, and updates filteredEntries
     * to correctly display change.
     * 
     * @param data sent from fullcalendar on the entry changed
     */
    const updateChange = async (data: EventDropArg) => {
        if (data.event.start && data.event.end) {
            // add changes to events backend (updateEvent)
            const res = await getEntryById(Number(data.event.id));
            const newEvent: Entry = res.data;

            newEvent.startDateTime = fixDateFormat(data.event.start) + fixTimeFormat(data.event.start);
            newEvent.endDateTime = fixDateFormat(data.event.end) + fixTimeFormat(data.event.end);
            const newFiltered = await Promise.all(filteredEntries.map((async (e) => {
                if (e.id == newEvent.id) {
                    return eventToCalEvent(newEvent);
                }
                return e;
            })))
            
            updateEntry(newEvent).then((updateRes) => {
                setFilteredEntries([...newFiltered]);
            }).catch(async (err) => {
                setShowEditErrorBar(true);
                data.revert();
                // edit old entry so it is no longer draggable
                if (data.oldEvent.start && data.oldEvent.end) {
                    newEvent.startDateTime = fixDateFormat(data.oldEvent.start) + fixTimeFormat(data.oldEvent.start);
                    newEvent.endDateTime = fixDateFormat(data.oldEvent.end) + fixTimeFormat(data.oldEvent.end);
                    const fixFiltered = await Promise.all(filteredEntries.map((async (e) => {
                        if (e.id == newEvent.id) {
                            const newCalEntry = eventToCalEvent(newEvent);
                            (await newCalEntry).editable = false; // turn off dragging
                            return newCalEntry;
                        }
                        return e;
                    })))
                    setFilteredEntries([...fixFiltered])
                }
            });
        }
    }

    /**
     * Makes the backend call to get all entries between the start and end dates specified.
     * Also sets the entries and filteredEntries arrays of the calendar.
     * 
     * @param start date string to get entries from
     * @param end date string to get entries until
     * @param id user id for verification
     */
    const renderFromRange = async (start: string, end: string, id: string) => {
        const res = await getByBetweenDateTime(start, end, id);
        const userEvents: CalendarEntry[] = [];

        const entryResult: Entry[] = res.data;
        if (entryResult) {
            await Promise.all(entryResult.map(async (entry: Entry) => {
                const calEvent = await eventToCalEvent(entry);
                userEvents.push(calEvent);
            }));
        }
        // add to list of rendered months
        setEntries([...entries, ...userEvents]);
        setFilteredEntries([...entries, ...userEvents]);
    }

    // CALENDAR FUNCTIONS

    /**
     * Called any time the calendar view is changed, (ie on redirect, changing months via next/prev)
     * handles setting the stored redux date correctly.
     */
    function changedView(dateInfo: DatesSetArg) {
        // If today's date is present in the currently rendered dates, then set the state to the current date
        if (isTodayInView(dateInfo.view.currentStart.toISOString(), dateInfo.view.currentEnd.toISOString())) {
            const newState: SelectedDate = {
                date: getTodayString(),
            }
            dispatch(setDate(newState));
        }
        else {
            const newState: SelectedDate = {
                date: dateInfo.view.currentStart.toISOString(),
            }
            dispatch(setDate(newState));
        }
        setViewApi(dateInfo.view);
    }

    /**
     * Handles Full Calendar duplicate bug where entries are duplicated on refresh or changed view
     */
    const handleEvents = (events: EventApi[]) => {

        const lookup = events.reduce((a: any, e) => {
            a[e.id] = ++a[e.id] || 0;
            return a;
        }, {});

        const duplicatedEvents = events.filter(e => lookup[e.id])

        if (duplicatedEvents.length) {
            duplicatedEvents.splice(-1, 1) // keep the last one
            duplicatedEvents.forEach(evt => evt.remove()) // remove the others, may be more than one
        }
    }

    /**
     * On clicking an event, the drawer will open with the entries that occur on the
     * date clicked. The redux store date will also be updated with this clicked date.
     */
    const handleEntryPrimaryClick = async (eventInfo: EventClickArg) => {
        // Need jquery in order to get the date of the cell by clicking the entry
        let dayCell = $(eventInfo.el).closest('.fc-daygrid-day');
        let cellDate = dayCell.attr('data-date');
        if (cellDate === undefined) {
            dayCell = $(eventInfo.el).closest('.fc-popover');
            cellDate = dayCell.attr('data-date');
        }

        
        // Set drawer date to be clickedDate
        const clickedDate = new Date(cellDate!);
        clickedDate.setDate(clickedDate.getDate() + 1);
        setSelectedDay(clickedDate);

        const d = new Date(cellDate!);
        let month = '' + (d.getMonth() + 1);
        let day = '' + (d.getDate() + 1);
        const year = d.getFullYear();
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        const date = [year, month, day].join('-');

        // Set entries to be shown in the drawer
        setSelectedEvents(filteredEntries.filter((entry) => {
            return entry.start.includes(date) || isBetweenDates(entry.start, date, entry.end!);
        }));

        await new Promise(r => setTimeout(r, 20)); // makes it much easier to double click before drawer opens
        setOpenDrawer(true);
        // set state when a day is clicked
        const newState: SelectedDate = {
            date: date
        }
        dispatch(setDate(newState));
    }

    /**
     * Sends the user to the edit page of the double clicked entry.
     * 
     * @param mouseEvent mouseEvent
     * @param entry to be edited
     */
    const handleEntryDoubleClick = (mouseEvent: React.MouseEvent<HTMLSpanElement, MouseEvent>, entry: CalendarEntry) => {
        if (entry.extendedProps.entryType === 'Event') {
            history.push(`/event/${entry.id}`)
        } else {
            history.push(`/journal/edit/${entry.id}`)
        }
    }

    /**
     * Sets the redux store date, updates the drawer selected events if the drawer is currently open,
     * and opens the entry menu at the mouse's current position.
     */
    const handleDayCellClick = (clickInfo:DateClickArg) => {
        // set state when a day is clicked
        const newState: SelectedDate = {
            date: clickInfo.dateStr
        }
        dispatch(setDate(newState));
        setSelectedDay(clickInfo.date);
        setEntryMenuAnchor(null);
        setEntryMenuCoords([clickInfo.jsEvent.clientX, clickInfo.jsEvent.clientY])

        // If the drawer is open, then also set the selected events to be shown
        if (openDrawer) {
            const d = new Date(clickInfo.dateStr);
            let month = '' + (d.getMonth() + 1);
            let day = '' + (d.getDate() + 1);
            const year = d.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            const date = [year, month, day].join('-');
            setSelectedEvents(filteredEntries.filter((entry) => {
                return entry.start.includes(date) || isBetweenDates(entry.start, date, entry.end!);
            }));
        }

        setOpenEntryMenu(true);
    }

    /**
     * Renders the next month of the calendar and checks to see if more entries need to be
     * loaded in advance based on the date range.
     */
    const handleNext = () => {
        if (viewApi) {
            viewApi.calendar.next();
            const currDay = viewApi.calendar.getDate();
            currDay.setMonth(currDay.getMonth() + 2);
            if (dateRange) {
                if (userId && currDay > dateRange.end) {
                    // render 6 months in the past
                    const newEndRange = new Date(dateRange.end.getFullYear(), dateRange.start.getMonth() + 6, 1);
                    renderFromRange(dateRange.end.toISOString(), newEndRange.toISOString(), userId.toString())

                    setDateRange({ ...dateRange, 'end': newEndRange })
                }
            }
        }
    }

    /**
     * Renders the previous month of the calendar and checks to see if more entries need to be
     * loaded in advance based on the date range.
     */
    const handlePrev = () => {
        if (viewApi) {
            viewApi.calendar.prev()
            const currDay = viewApi.calendar.getDate();
            currDay.setMonth(currDay.getMonth() - 2);
            if (dateRange) {
                if (userId && currDay < dateRange.start) {
                    // render 6 months in the past
                    const newStartRange = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() - 6, 1);
                    renderFromRange(newStartRange.toISOString(), dateRange.start.toISOString(), userId.toString())

                    setDateRange({ ...dateRange, 'start': newStartRange })
                }
            }
        }
    }

    /**
     * Uses two arrays passed from TagMenuFilter to determine which entries should be excluded from view.
     * 
     * @param types array that will contain which type of entry to filter out ('Event' or 'Journal')
     * @param tagList array that will contain the tags that entries should be filtered out by
     */
    const applyFilters = (types: string[], tagList: Tag[]) => {
        let sortedEntries = entries;
        // Filter out the specified type 'Events' and/or 'Journal'
        types.forEach((type) => {
            sortedEntries = sortedEntries.filter((entry) => entry.extendedProps.entryType !== type);
        })

        // If the entry's tag list matches the one that should be filtered out, then it will be filtered out
        const tagListIds = tagList.map((tag) => tag.id);
        tagListIds.forEach((id) => {
            sortedEntries = sortedEntries.filter((entry) => {
                if (entry.extendedProps.tags.length === 0)
                    return true;
                let entryTagIds = entry.extendedProps.tags.map((tag) => tag.id);
                entryTagIds = entryTagIds.filter(function (el) {
                    return !tagListIds.includes(el);
                })
                return entryTagIds.length !== 0;
            })
        })

        setFilteredEntries(sortedEntries);
    }

    /**
     * Called after the first time the calendar is rendered
     */
    const handleDidMount = (arg: ViewMountArg) => {
        setViewApi(arg.view)
    }

    // HANDLER FUNCTIONS / UTILITY FUNCTIONS

    const handleDrawerOpen = () => {
        setOpenDrawer(true);
    }

    const handleDrawerClose = () => {
        setOpenDrawer(false);
    }

    const handleEntryMenuOpen = (instance: React.MutableRefObject<null>) => {
        setEntryMenuAnchor(instance?.current);
        setOpenEntryMenu(true);
    }

    const handleEntryMenuClose = () => {
        setOpenEntryMenu(false);
    }

    /**
     * Moves the calendar view to today's month.
     */
    const moveToToday = () => {
        if (viewApi) {
            viewApi.calendar.today();
        }
    }

    // CUSTOM RENDER FOR CALENDAR ENTRIES

    const customRender = (eventInfo: { event: CalendarEntry, timeText: string }) => {
        const entryStartDate = new Date(eventInfo.event.start)
        const entryEndDate = new Date(eventInfo.event.end ? eventInfo.event.end : eventInfo.event.start)
        const isOneDay = entryStartDate.getDate() === entryEndDate.getDate();
        return (
            <>
                {isOneDay ? <Fab
                    id={'fab-' + eventInfo.event.id}
                    style={{
                        backgroundColor: eventInfo.event.backgroundColor,
                        minWidth: '20px',
                        maxWidth: '20px',
                        minHeight: '20px',
                        maxHeight: '20px'
                    }}
                    disabled={true}
                    disableFocusRipple={true}
                    disableRipple={true}
                    onDoubleClick={(e) => handleEntryDoubleClick(e, eventInfo.event)}
                >
                </Fab> : <></>}
                <Typography onDoubleClick={(e) => handleEntryDoubleClick(e, eventInfo.event)} style={{ fontWeight: 'bold', fontSize: 12, paddingLeft: '2%', whiteSpace: 'normal', display: 'inline-block' }}>{eventInfo.timeText}</Typography>
                <Typography onDoubleClick={(e) => handleEntryDoubleClick(e, eventInfo.event)} variant='caption' style={{ fontSize: 12, paddingLeft: '4%', whiteSpace: 'normal', display: 'inline-block' }}>{eventInfo.event.title}</Typography>
            </>
        );
    }

    return (
        <div className="calendar-month">
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: openDrawer,
                })}
            >
                <Grid container>
                    <ActionBarFC
                        onAddEntry={handleEntryMenuOpen}
                        dateTitle={viewApi ? viewApi.title : ''}
                        currentYear={2021}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        currView={'MONTH'}
                        applyFilters={applyFilters}
                        entries={entries}
                        viewUpdated={updateOnViewChange}
                        today={moveToToday}
                    />
                </Grid>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: '',
                        right: ''
                    }}
                    initialView="dayGridMonth"
                    editable
                    selectable
                    selectMirror
                    dayMaxEvents
                    events={filteredEntries}
                    eventClick={handleEntryPrimaryClick}
                    eventsSet={handleEvents}
                    eventDrop={updateChange}
                    eventContent={customRender} // custom render function
                    dayHeaderFormat={{
                        weekday: 'long'
                    }}
                    fixedWeekCount={false}
                    initialDate={startDate}
                    datesSet={changedView}
                    viewDidMount={handleDidMount}
                    //select={handleDayCellSelect}
                    dateClick={handleDayCellClick}
                />
            </main>
            <AddEntryMenu
                showEntryMenu={openEntryMenu}
                toggleEntryMenu={handleEntryMenuClose}
                entryMenuAnchorEl={entryMenuAnchor}
                entryMenuCoords={entryMenuCoords}
                addEntryToUser={addEntryToUser}
                setFilteredEntries={setFilteredEntries}
                filteredEntries={filteredEntries}
            />
            <Drawer events={selectedEvents} selectedDay={selectedDay} shouldOpen={openDrawer} shrinkCal={handleDrawerOpen} close={handleDrawerClose} />
            <EditErrorBar open={showEditErrorBar} setShowEditErrorBar={setShowEditErrorBar} />
        </div>
    );
}

export default MonthCalendar;


