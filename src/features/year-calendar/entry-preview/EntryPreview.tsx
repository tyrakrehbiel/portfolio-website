import * as React from 'react';
import { Typography, Tooltip} from '@material-ui/core';
import { motion , AnimatePresence} from 'framer-motion';
import { useHistory } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { EntryPreviewProps } from '../../../@types/calendar';
import { Tag } from '../../../@types';
import { getEntryTags, getEntryDuration } from '../../../common/calendar-utils/CalendarUtils';

import './_EntryPreview.scss';

const EntryPreview: React.FC<EntryPreviewProps> = ({preview, isOpened, setOpened}: EntryPreviewProps) => {

    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);
    const history = useHistory()

    const startDate =  new Date(preview.entry.startDateTime);
    const endDate =  new Date(preview.entry.endDateTime);

    //get dates determine event preview placement
    const options: Intl.DateTimeFormatOptions = {weekday: 'short', month: 'short', day: 'numeric'};
    const startDateStr = startDate.toLocaleDateString('en-US', options);
    const endDateStr =  endDate.toLocaleDateString('en-US', options);

    //get start and end times in proper format: HH:MM
    const startTime = startDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
    const endTime = endDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});

    //determine if endDate needs to be displayed
    const spansMultiple = getEntryDuration(startDate, endDate) > 1 ? true : false;

    //get description
    const descStr = preview.entry.description;

    //get location 
    const locationStr = preview.entry.location;

    const toggleOpen = () => {
        if (isOpened){
            setOpened(undefined)
        }else{
            setOpened(preview.entry.id)
        }
    }

    React.useEffect(() => {
        (async () => {
            const res = await getEntryTags(preview.entry.tagIds);
            setEntryTags(res);
        })()
    }, [])

    const tagStr = entryTags[0]?.name;

    function getTagNames() {
        let str = '';
        for (let i=0; i<entryTags.length; i++) {
            const tag = entryTags[i];

            if (i==entryTags.length-1)
                str += tag.name
            else
                str += tag.name + ', '
        }
        return str;
    }

    const handleEditClick = () => {
        if (preview.entry.entryType === 'Event') {
            history.push(`/event/${preview.entry.id}`)
        } else {
            history.push(`/journal/edit/${preview.entry.id}`)
        }
    }

    function Content(){
        return (
            <motion.div
                key={`entry-preview-${preview.entry.id}-preview-content`}
                className='entry-preview content'
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 , transition:{ duration: .4, ease: 'easeInOut'}}}
                exit={{ opacity: 0 , transition:{ duration: .4, ease: 'easeInOut'}}}
            >
                <Typography className= 'desc'>{descStr}</Typography>
                <Typography className='details'> <b>Location:</b> {locationStr}<br/></Typography>
                <Typography className='details'> <b>Tags: </b> {getTagNames()}</Typography>
            </motion.div>
        );
    }

    function DateTimeSubtitle(){
        return(
            <Typography noWrap className= 'subtitle'>
                { preview.entry.entryType == 'Event' ?
                    startDateStr + (spansMultiple ? ` - ${endDateStr}` : '') + ` | ${startTime} - ${endTime} `
                    : 
                    `Created:  ${startDateStr} | ${startTime} `
                }
            </Typography>
        )
    }

    return(
        <motion.li
            key={`entry-preview-${preview.entry.id}-root`}
            className='entry-preview entry-card'
            layout
            onClick={toggleOpen} 
            initial={{ borderRadius: '8px' }}
        > 
            <motion.div key={`entry-preview-${preview.entry.id}-header`} className='entry-header' layout >
                <Tooltip title={`Tag:  ${tagStr? tagStr : 'Not Assigned'}`}>
                    <motion.div className='avatar' style={{backgroundColor: preview.color}} layout></motion.div>
                </Tooltip>
                <motion.div className='header-text'>
                    <Typography className= 'title'>
                        {preview.entry.title}
                    </Typography>
                    <DateTimeSubtitle/>
                </motion.div>
                <motion.div key={`eventpreview-${preview.entry.id}-day-action-area`}  className='entry-preview-action-area'>
                    <Tooltip title= {'Edit ' + preview.entry.entryType}>
                        <EditIcon className='preview-icons' onClick={handleEditClick}/>
                    </Tooltip>
                    <Tooltip title='Add Attachment'>
                        <AttachFileIcon className='preview-icons' onClick={() => alert('add attachment')}/>
                    </Tooltip>
                </motion.div>
            </motion.div>
            <AnimatePresence initial={false}>{isOpened && <Content/>}</AnimatePresence>
        </motion.li>
    )
}

export default EntryPreview;
