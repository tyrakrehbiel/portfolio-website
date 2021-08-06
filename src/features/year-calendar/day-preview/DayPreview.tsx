import React from 'react';
import { motion, AnimateSharedLayout, AnimatePresence} from 'framer-motion';
import $ from 'jquery';
import {IconButton, Typography, Tooltip, Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EventIcon from '@material-ui/icons/Event';
import NoteAddIcon from '@material-ui/icons/NoteAdd';

import { useAppSelector } from '../../../store/hooks';
import { DayPreviewProps} from '../../../@types/calendar';
import EntryPreview from '../entry-preview/EntryPreview';
import CreateJournalModal from '../../create-edit-journal/CreateJournalModal';
import { CreateEventModal } from '../../event-modal/CreateEventModal';

interface PreviewLocation{
    right?: number | string,
    bottom?: number | string,
}

const COLUMN_EDGE = 10;
const ROW_EDGE = 20;

const DayPreview: React.FC<DayPreviewProps> = ({entryPreviews, position, handleClosePreview, addEntryToUser, updateCalendar}: DayPreviewProps) => {

    const userId = useAppSelector(store => store.user.user.id);

    //allow only one entryPreview to be open at a time
    const [previewOpened, setPreviewOpened ]= React.useState<number| undefined>();
    const [previewLocation, setPreviewLocaiton] = React.useState<PreviewLocation>({
        right: 'inherit',
        bottom: 'inherit',
    })
    const [openEventModal, setOpenEventModal] = React.useState<boolean>(false);
    const [openJournalModal, setOpenJournalModal] = React.useState<boolean>(false);

    const options: Intl.DateTimeFormatOptions = {weekday: 'short', month: 'short', day: 'numeric'};
    const dateStr = new Date(position.yearIdx, position.monthIdx-1, position.dayIdx).toLocaleDateString('en-US', options);
    const previewId = `day-preview-month-${position.monthIdx}-day${position.dayIdx}`;

    //animation variants
    const transition = {
        duration: .4, 
        ease: 'easeInOut',
    };
    const variants = {
        initial: { opacity: 0, borderRadius: '8px', previewLocation},
        enter: {opacity: 1, transition, previewLocation},
        exit: {opacity: 0, transition, previewLocation},
    };

    React.useEffect(() => {
        updatePosition();
    }, [previewOpened , $(window).innerWidth(), $(window).innerHeight()])

    function willOverflowRight(){
        const elOffset = $(`#${previewId}`).offset();
        const elOuterWidth = $(`#${previewId}`).outerWidth();
        const windInnerWidth = $(window).innerWidth();

        if(elOffset && elOuterWidth && windInnerWidth){
            
            const elCoordLeft = elOffset.left;
            const elRightEdge = elCoordLeft+ elOuterWidth;
            const windRightEdge = windInnerWidth;

            if ((elRightEdge > windRightEdge)){
                return true;
            } else {
                return false;
            }
        }
    }

    function willOverflowBottom() {

        const elOffset = $(`#${previewId}`).offset();
        const elOuterHeight = $(`#${previewId}`).outerHeight();
        const windInnerHeight = $(window).innerHeight();

        if(elOffset && elOuterHeight && windInnerHeight){
            
            const elCoordTop = elOffset.top;
            const elBottomEdge = elCoordTop + elOuterHeight;
            const windBottomEdge = windInnerHeight;

            if ((windBottomEdge < elBottomEdge)){
                return true;
            } else {
                return false;
            }
        }
    }

    const updatePosition = () => {

        const updateLocation: PreviewLocation = {
            right: 'inherit',
            bottom: 'inherit',
        }

        if (willOverflowRight() || position.monthIdx >= COLUMN_EDGE){
            updateLocation.right = 0;
        }

        if(willOverflowBottom() || position.dayIdx > ROW_EDGE){
            updateLocation.bottom = 1;
        }

        setPreviewLocaiton(updateLocation);
    }

    function setOpened (entryId: number | undefined){
        setPreviewOpened(entryId);
    }

    const handleEventModalClose = () => {
        setOpenEventModal(false);
    }

    const handleJournalModalClose = () => {
        setOpenJournalModal(false);
    }

    const handleClose = () => {
        handleClosePreview();
    }

    const CreateEntryModal  = () => {
        return(
            <div >
                <Modal
                    open={openEventModal}
                    onClose={handleEventModalClose}
                    className='modal-form'
                    disableScrollLock
                >
                    <div className='event-modal-form'>
                        <CreateEventModal
                            userId={Number(userId)}
                            addEntry={addEntryToUser}
                            updateCalendar={updateCalendar}
                            modalOpen={openEventModal}
                            handleModalClose={handleEventModalClose}
                        />
                    </div>
                </Modal>
                <Modal
                    open={openJournalModal}
                    onClose={handleJournalModalClose}
                    className='modal-form'
                    disableScrollLock
                >
                    <div className='event-modal-form'>
                        <CreateJournalModal
                            addEntry={addEntryToUser}
                            updateCalendar={updateCalendar}
                            modalOpen={openJournalModal}
                            handleModalClose={handleJournalModalClose}
                        />
                    </div>
                </Modal>
            </div>
        )
    }

    return (
        <div>
            <AnimatePresence>
                <AnimateSharedLayout>
                    <motion.ul 
                        id = {'preview-'+previewId}
                        className='day-preview day-preview-list'
                        initial='initial'
                        animate='enter'
                        exit='exit'
                        layout
                        variants={variants}
                        style = {previewLocation}
                    >
                        <motion.div className='day-preview-header' layout>
                            <Typography className= 'day-title'> {dateStr}</Typography>
                            <Tooltip title='Close'>
                                <IconButton className= 'close-btn' onClick={handleClose}><CloseIcon className='close-icon'/></IconButton>
                            </Tooltip>
                        </motion.div>
                        <motion.div className = 'preview-cards' layout>
                            {entryPreviews.map((preview) => (
                                <EntryPreview 
                                    key={preview.entry.id} 
                                    preview={preview}
                                    isOpened = {previewOpened == preview.entry.id ? true: false}
                                    setOpened={setOpened}
                                />
                            ))}
                        </motion.div>
                        <motion.div className='preview-footer' layout>
                            <motion.div key={`daypreview-${previewId}-day-action-area`} className='day-action-area'>
                                <Tooltip title= 'Add Event '> 
                                    <IconButton size='small' onClick={(e) => setOpenEventModal(true)}><EventIcon fontSize='medium' className='preview-icon'/></IconButton>
                                </Tooltip>
                                <Tooltip title= 'Add Journal '> 
                                    <IconButton size='small' onClick={(e) => setOpenJournalModal(true)}><NoteAddIcon  fontSize='medium' className='preview-icon'/></IconButton>
                                </Tooltip>
                            </motion.div>
                        </motion.div>
                    </motion.ul>
                </AnimateSharedLayout>
            </AnimatePresence>
            {<CreateEntryModal/>} 
        </div>
    )
}

export default DayPreview;