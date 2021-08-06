import * as React from 'react';
import { Typography, IconButton, Tooltip, Button } from '@material-ui/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';

import { EntryPreviewProps } from '../../../@types/calendar';
import { Tag, Entry } from '../../../@types';
import { getEntryTags, getEntryDuration } from '../../calendar-utils/CalendarUtils';

import './_InvitationPreview.scss';

export interface Props {
    preview: Entry,
    setResponse: (resp: boolean)  => void
}

const InvitationPreview: React.FC<Props> = props => {
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);
    const history = useHistory()

    const startDate = new Date(props.preview.startDateTime);
    const endDate = new Date(props.preview.endDateTime);

    //get dates determine event preview placement
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const startDateStr = startDate.toLocaleDateString('en-US', options);
    const endDateStr = endDate.toLocaleDateString('en-US', options);

    //get start and end times in proper format: HH:MM
    const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    //determine if endDate needs to be displayed
    const spansMultiple = getEntryDuration(startDate, endDate) > 1 ? true : false;

    //get description
    const descStr = props.preview.description;

    //get location 
    const locationStr = props.preview.location;

    React.useEffect(() => {
        (async () => {
            const res = await getEntryTags(props.preview.tagIds);
            setEntryTags(res);
        })()
    }, [])

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

    function Content(){
        return (
            <motion.div
                className='invite-preview content'
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                { props.preview.entryType == 'Event' ?
                    startDateStr + (spansMultiple ? ` - ${endDateStr}` : '') + ` | ${startTime} - ${endTime} `
                    : 
                    `Created:  ${startDateStr} | ${startTime} `
                }
            </Typography>
        )
    }
    return(
        <motion.li
            className='invite-preview entry-card'
            layout
            initial={{ borderRadius: '8px' }}
        > 
            <motion.div className='entry-header' layout >
                <motion.div className='avatar' style={{backgroundColor: (entryTags.length > 0 ? entryTags[0].color : 'grey')}} layout></motion.div>
                <motion.div className='header-text'>
                    <Typography className= 'title'>
                        {props.preview.title}
                    </Typography>
                    <DateTimeSubtitle/>
                </motion.div>
            </motion.div>
            <Content/>
            <div>
                <Button className='decision-button accept' onClick={() => props.setResponse(true)}>ACCEPT</Button>
                <Button className='decision-button decline'onClick={() => props.setResponse(false)}>DECLINE</Button>
            </div>
        </motion.li>
    )
}


export default InvitationPreview;
