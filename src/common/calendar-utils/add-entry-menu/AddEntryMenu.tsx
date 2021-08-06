import * as React from 'react';
import { Modal, Menu, MenuItem } from '@material-ui/core';

import { useAppSelector } from '../../../store/hooks';
import { ImportEventsModal } from '../../../features/import-events/ImportEvents';
import { CreateEventModal } from '../../../features/event-modal/CreateEventModal';
import { CreateJournalModal } from '../../../features/create-edit-journal/CreateJournalModal';

import './_AddEntryMenu.scss';
import { CalendarEntry, Entry } from '../../../@types';

interface Props {
    showEntryMenu: boolean,
    toggleEntryMenu: () => void,
    entryMenuAnchorEl: HTMLElement | null,
    entryMenuCoords?: number[],
    addEntryToUser: (entryId: number) => Promise<any>,
    updateCalendar?: (entry: Entry) => void, //used to update year calendar view
    setFilteredEntries?: React.Dispatch<React.SetStateAction<CalendarEntry[]>>,
    filteredEntries?: CalendarEntry[]
}

const AddEntryMenu: React.FunctionComponent<Props> = props => {
    // const
    const userId = useAppSelector(store => store.user.user.id);

    // states
    const [openImport, setOpenImport] = React.useState<boolean>(false);
    const [openNewEvent, setOpenNewEvent] = React.useState<boolean>(false);
    const [openNewJournal, setOpenNewJournal] = React.useState<boolean>(false);

    // toggles
    const toggleImport = () => {
        setOpenImport(openImport ? false : true);
    }

    const toggleNewEvent = () => {
        setOpenNewEvent(openNewEvent ? false : true);
    }

    const toggleNewJournal = () => {
        setOpenNewJournal(openNewJournal ? false : true);
    }

    const handleClose = () => {
        props.toggleEntryMenu();
    }

    const chooseMenu = () => {
        // If there is an anchorEl, then opens at that anchor, else opens at a certain position
        if (props.entryMenuAnchorEl) {
            return (
                <Menu
                    id='simple-menu'
                    anchorEl={props.entryMenuAnchorEl}
                    getContentAnchorEl={null}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={props.showEntryMenu}
                    onClose={handleClose}
                    onMouseLeave={handleClose}
                    style={{ width: '120px' }}
                >
                    <MenuItem onClick={toggleNewEvent} alignItems='center'>Event</MenuItem>
                    <MenuItem onClick={toggleNewJournal} alignItems='center'>Journal</MenuItem>
                    <MenuItem onClick={toggleImport} alignItems='center'>Import</MenuItem>
                </Menu>
            )
        }
        else {
            if (props.entryMenuCoords) {
                return (
                    <Menu
                        id='simple-menu'
                        anchorReference='anchorPosition'
                        anchorPosition={{ top: props.entryMenuCoords[1], left: props.entryMenuCoords[0] }}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={props.showEntryMenu}
                        onClose={handleClose}
                        onMouseLeave={handleClose}
                        style={{ width: '120px' }}
                    >
                        <MenuItem onClick={toggleNewEvent} alignItems='center'>Event</MenuItem>
                        <MenuItem onClick={toggleNewJournal} alignItems='center'>Journal</MenuItem>
                        <MenuItem onClick={toggleImport} alignItems='center'>Import</MenuItem>
                    </Menu>
                )
            }
            return null;
        }
    }

    return (
        <div>
            {
                chooseMenu()
            }
            {openNewEvent &&
                <Modal
                    open={openNewEvent}
                    onClose={toggleNewEvent}
                    className="modal-form"
                    disableScrollLock
                >
                    <div className="event-modal-form">
                        <CreateEventModal
                            userId={Number(userId)}
                            addEntry={props.addEntryToUser}
                            updateCalendar={props.updateCalendar}
                            modalOpen={openNewEvent}
                            handleModalClose={toggleNewEvent}
                            setFilteredEntries={props.setFilteredEntries}
                            filteredEntries={props.filteredEntries}
                        />
                    </div>
                </Modal>
            }
            {openNewJournal &&
                <Modal
                    open={openNewJournal}
                    onClose={toggleNewJournal}
                    className="modal-form"
                    disableScrollLock
                >
                    <div className="event-modal-form">
                        <CreateJournalModal
                            addEntry={props.addEntryToUser}
                            updateCalendar={props.updateCalendar}
                            modalOpen={openNewJournal}
                            handleModalClose={toggleNewJournal}
                            setFilteredEntries={props.setFilteredEntries}
                            filteredEntries={props.filteredEntries}
                        />
                    </div>
                </Modal>
            }
            {openImport &&
                <Modal
                    open={openImport}
                    onClose={toggleImport}
                    className="modal-form"
                    disableScrollLock
                >
                    <div className="event-import-form">
                        <ImportEventsModal
                            userId={Number(userId)}
                            addEntry={props.addEntryToUser}
                            modalOpen={openImport}
                            handleModalClose={toggleImport}
                        />
                    </div>
                </Modal>
            }
        </div>
    )
}

export default AddEntryMenu;