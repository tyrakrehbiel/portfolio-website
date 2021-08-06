import * as React from 'react';
import FullCalendar, { DateSelectArg, DatesSetArg, EventDropArg, ViewApi, ViewMountArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { useHistory } from 'react-router-dom';
import { Entry, CalendarEntry, SelectedDate, Tag } from '../../@types';
import './_WeekCalendar.scss'
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDate } from '../../store/selectedDaySlice';
import { eventToCalEvent, fixDateFormat, fixTimeFormat, isTodayInView, getTodayString } from '../../common/calendar-utils/CalendarUtils';
import EntryPopover from '../month-calendar/EntryPopover'
import { getEntryById, updateEntry, getByBetweenDateTime } from '../../axios/entries';
import { addUserEntry } from '../../axios/user';
import { Grid } from '@material-ui/core';
import ActionBarFC from '../../common/calendar-utils/action-bar/ActionBarFC';
import { DateRange } from '../../@types/calendar';
import EditErrorBar from '../../common/snackbars/EditErrorBar';
import AddEntryMenu from '../../common/calendar-utils/add-entry-menu/AddEntryMenu';

const WeekCalendar: React.FC = () => {
    // STATES FOR FULLCALENDAR
    const [viewApi, setViewApi] = React.useState<ViewApi>(); // ViewApi object for fullcalendar
    const [entries, setEntries] = React.useState<CalendarEntry[]>([]); // Entries array that should never have filters applied
    const [filteredEntries, setFilteredEntries] = React.useState<CalendarEntry[]>([]); // A copy of the entries array to apply filters to, and the actual list that fullcal renders events from
    const [selectedEntry, setSelectedEntry] = React.useState<CalendarEntry>({
        id: undefined,
        title: '',
        start: '',
        end: '',
        extendedProps: {
            tagColor: '',
            entryType: '',
            description: '',
            tags: [],
            primaryTagId: undefined,
        },
        backgroundColor: '',
        editable: true
    });
    const [dateRange, setDateRange] = React.useState<DateRange>(); // Range of dates to render events for
    const [updateOnViewChange, setUpdateOnViewChange] = React.useState<boolean>(false); // Used to tell the TagMenuFilter when to re-render
    // STATES FOR HANDLING OTHER COMPONENTS
    const [displayPopover, setDisplayPopover] = React.useState<boolean>(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [openEntryMenu, setOpenEntryMenu] = React.useState<boolean>(false);
    const [entryMenuAnchor, setEntryMenuAnchor] = React.useState<HTMLButtonElement | HTMLElement | null>(null);
    const [entryMenuCoords, setEntryMenuCoords] = React.useState<number[]>([0, 0]);
    // REDUX
    const dispatch = useAppDispatch();
    const startDate = useAppSelector(store => store.selectedDate.date) // used to start calendar on date selected in other views
    const userId = useAppSelector(store => store.user.user.id);
    // HISTORY
    const history = useHistory()
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
            setEntries(prev => [...prev, newEntry])
        });
    }

    /**
     * Updates the entry in the backend after drag-and-drop, and updates filteredEntries
     * to correclty display change.
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
                setFilteredEntries([...newFiltered])
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
        // Else do nothing, stored redux date will only be changed when doing next and prev buttons
        
        setViewApi(dateInfo.view);
    }

    /**
     * Opens the entry card popover and sets the entry to be displayed.
     */
    const handleEntryPrimaryClick = async (clickInfo: any) => {
        setPopoverAnchorEl(clickInfo.el);
        setDisplayPopover(true);
        setSelectedEntry({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end ? clickInfo.event.end : undefined,
            extendedProps: {
                tagColor: clickInfo.event.extendedProps.tagColor,
                entryType: clickInfo.event.extendedProps.entryType,
                description: clickInfo.event.extendedProps.description,
                tags: clickInfo.event.extendedProps.tags,
                primaryTagId: clickInfo.event.extendedProps.primaryTagId,
            },
            backgroundColor: clickInfo.event.extendedProps.tagColor,
            editable: clickInfo.event.editable
        });
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
     * Sets the redux store date and opens the entry menu at the mouse's current position.
     */
    const handleDayCellClick = (clickInfo: DateClickArg) => {
        // set state when a day is clicked
        const newState: SelectedDate = {
            date: clickInfo.dateStr
        }
        dispatch(setDate(newState));
        setEntryMenuAnchor(null);
        setEntryMenuCoords([clickInfo.jsEvent.clientX, clickInfo.jsEvent.clientY])
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
            const newState: SelectedDate = {
                date: viewApi.currentStart.toISOString(),
            }
            dispatch(setDate(newState));
            currDay.setMonth(currDay.getMonth()+2);
            if(dateRange) {
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
            const newState: SelectedDate = {
                date: viewApi.currentStart.toISOString(),
            }
            dispatch(setDate(newState));
            currDay.setMonth(currDay.getMonth()-2);
            if(dateRange) {
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
     * Sets the redux store date to the one selected.
     */
    const dateSelect = (selectionInfo: DateSelectArg) => {
        const newState: SelectedDate = {
            date: selectionInfo.startStr
        }
        dispatch(setDate(newState));
    }

    /**
     * Called after the first time the calendar is rendered
     */
    const handleDidMount = (arg: ViewMountArg) => {
        setViewApi(arg.view)
    }

    // HANDLER FUNCTIONS / UTILITY FUNCTIONS

    const handleCloseEventPopover = () => {
        setDisplayPopover(false);
        setPopoverAnchorEl(null);
    }

    const handleOpenEntryMenu = (instance: React.MutableRefObject<null>) => {
        setEntryMenuAnchor(instance?.current);
        setOpenEntryMenu(true)
    }

    const handleCloseEntryMenu = () => {
        setOpenEntryMenu(false);
    }

    const moveToToday = () => {
        if (viewApi) {
            viewApi.calendar.today();
        }
    }

    // CUSTOM RENDER FUNCTION

    function renderEventContent(eventInfo: any) {
        return (
            <>
                <i onDoubleClick={(e) => handleEntryDoubleClick(e, eventInfo.event)}>{eventInfo.timeText}</i>
                <br />
                <b onDoubleClick={(e) => handleEntryDoubleClick(e, eventInfo.event)}>{eventInfo.event.title}</b>
            </>
        );
    }

    return (
        <div className="WeekCalendarContainer">
            <Grid container>
                <ActionBarFC
                    onAddEntry={handleOpenEntryMenu}
                    dateTitle={viewApi ? viewApi.title : ''}
                    currentYear={2021}
                    handleNext={handleNext}
                    handlePrev={handlePrev}
                    currView={'WEEK'}
                    applyFilters={applyFilters}
                    entries={entries}
                    viewUpdated={updateOnViewChange}
                    today={moveToToday}
                />
            </Grid>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: '',
                    right: ''
                }}

                events={filteredEntries}
                editable={true}
                selectable={true}
                select={dateSelect}
                eventDrop={updateChange}
                eventClick={handleEntryPrimaryClick}
                eventContent={renderEventContent} // custom render function
                allDaySlot={false}
                nowIndicator
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: true
                }}
                initialDate={startDate}
                datesSet={changedView}
                viewDidMount={handleDidMount}
                dateClick={handleDayCellClick}
            />
            <AddEntryMenu
                showEntryMenu={openEntryMenu}
                toggleEntryMenu={handleCloseEntryMenu}
                entryMenuAnchorEl={entryMenuAnchor}
                entryMenuCoords={entryMenuCoords}
                addEntryToUser={addEntryToUser}
                setFilteredEntries={setFilteredEntries}
                filteredEntries={filteredEntries}
            />
            <EntryPopover
                entry={selectedEntry}
                displayPopover={displayPopover}
                handleCloseEventPopover={handleCloseEventPopover}
                anchorEl={popoverAnchorEl}
            />
            <EditErrorBar open={showEditErrorBar} setShowEditErrorBar={setShowEditErrorBar} />
        </div >
    )
};

export default WeekCalendar;
