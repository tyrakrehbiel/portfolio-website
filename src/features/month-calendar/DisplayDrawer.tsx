import React from 'react';
import clsx from 'clsx';
import {
    createStyles,
    makeStyles,
    useTheme,
    Theme
} from '@material-ui/core/styles';
import { CalendarEntry } from '../../@types';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EntryCard from './EntryCard';
import { CreateEventModal } from '../event-modal/CreateEventModal';
import { useHistory } from 'react-router';
import { Divider, List, ListItem, ListItemText, Typography, IconButton, Tooltip, Modal } from '@material-ui/core';
import { useAppSelector } from '../../store/hooks';
import { addUserEntry } from '../../axios/user';
import CreateJournalModal from '../create-edit-journal/CreateJournalModal';

const drawerWidth = 370;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex'
        },
        menuButton: {
            // marginRight: 36
            position: 'absolute',
            right: '0',
            top: '50%',
            backgroundColor: '#6868D5',
            color: 'white'
        },
        hide: {
            display: 'none'
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-start',
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3)
        },
    })
);

interface Props {
    events: CalendarEntry[]
    selectedDay: Date
    shouldOpen: boolean
    shrinkCal: () => void // Needed for handling drawer opening after clicking button (as opposed to selecting a date)
    close: () => void // Needed for handling drawer closing after selecting a day in the calendar
}

const DisplayDrawer: React.FC<Props> = ({ events, selectedDay, shouldOpen, shrinkCal, close}: Props) => {

    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [openEventModal, setOpenEventModal] = React.useState<boolean>(false);
    const [openJournalModal, setOpenJournalModal] = React.useState<boolean>(false);
    const history = useHistory();

    const userId = useAppSelector(store => store.user.user.id);

    React.useEffect(() => {
        setOpen(shouldOpen);
    }, [shouldOpen])

    const handleDrawerOpen = () => {
        setOpen(true);
        shrinkCal();
    };

    const handleDrawerClose = () => {
        setOpen(false);
        close();
    };

    const handleEventModalClose = () => {
        setOpenEventModal(false);
    }

    const handleJournalModalClose = () => {
        setOpenJournalModal(false);
    }

    const addEntryToUser = (entryId: number) => {
        return addUserEntry(Number(userId), entryId);
    }

    const options: Intl.DateTimeFormatOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const currentDate = (isNaN(selectedDay.valueOf())) ? '' : selectedDay.toLocaleDateString('en-US', options);

    return (
        <div className={classes.root}>
            <CssBaseline />

            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                style={{ right: '-25px' }}
                className={clsx(classes.menuButton, 'drawer-button', {
                    [classes.hide]: open
                })}
            >
                <ArrowBackIosIcon className='drawer-button-icon'/>
            </IconButton>
            <Drawer
                variant="persistent"
                className={classes.drawer}
                classes={{
                    paper: classes.drawerPaper
                }}
                anchor="right"
                open={open}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? (
                            <ChevronRightIcon />
                        ) : (
                            <ChevronLeftIcon />
                        )}
                    </IconButton>
                </div>
                <Divider />
                <Typography variant='h2' component='h2' align='center' style={{fontSize: '28px'}}>
                    {currentDate} 
                </Typography>
                <List>
                    <ListItem key={'events'}>
                        <ListItemText primary={'Events'} />
                        <Tooltip title='Create Event'>
                            <IconButton onClick={(e) => setOpenEventModal(true)}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                    {events.filter((entry) => entry.extendedProps.entryType === 'Event').map((event) => {
                        return (
                            <ListItem key={'event-' + event.id}>
                                <EntryCard entry={event}/>
                            </ListItem>
                        )
                    })}
                </List>
                <Divider />
                <List>
                    <ListItem key={'journal'}>
                        <ListItemText 
                            primary={'Journals'} 
                        />
                        <Tooltip title='Create Journal'>
                            <IconButton onClick={(e) => setOpenJournalModal(true)}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                    {events.filter(
                        (entry) => entry.extendedProps.entryType === 'Journal')
                        .map((journal) => {
                            return (
                                <ListItem key={'journal-' + journal.id}>
                                    <EntryCard entry={journal}/>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Drawer>
            <Modal
                open={openEventModal}
                onClose={handleEventModalClose}
                className="modal-form"
                disableScrollLock
            >
                <div className="event-modal-form">
                    <CreateEventModal
                        userId={Number(userId)}
                        addEntry={addEntryToUser}
                        modalOpen={openEventModal}
                        handleModalClose={handleEventModalClose}
                    />
                </div>
            </Modal>
            <Modal
                open={openJournalModal}
                onClose={handleJournalModalClose}
                className="modal-form"
                disableScrollLock
            >
                <div className="event-modal-form">
                    <CreateJournalModal
                        addEntry={addEntryToUser}
                        modalOpen={openJournalModal}
                        handleModalClose={handleJournalModalClose}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default DisplayDrawer;

