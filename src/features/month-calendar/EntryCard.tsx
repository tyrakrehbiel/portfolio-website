import React from 'react';
import {
    createStyles,
    makeStyles,
} from '@material-ui/core/styles';
import { CalendarEntry } from '../../@types';
import { Card, Typography, CardContent, CardHeader, CardActions, Fab, IconButton, CardActionArea } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useHistory } from 'react-router';

const useStyles = makeStyles(() =>
    createStyles({
        card: {
            minWidth: 100,
            minHeight: 100,
            flexGrow: 1,
            boxShadow: '2px 2px 7px 0px lightgrey',
            borderRadius: '3px',
        }
    })
);

interface Props {
    entry: CalendarEntry,
}

const EntryCard: React.FC<Props> = ({ entry }: Props) => {
    const classes = useStyles();

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const startTime = new Date(entry.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = entry.end ? new Date(entry.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    const entryDate = (isNaN(new Date(entry.start).valueOf())) ? '' : new Date(entry.start).toLocaleDateString('en-US', options);
    const [shadow, setShadow] = React.useState<any>('');

    const history = useHistory();

    const handleEdit = () => {
        if (entry.extendedProps.entryType === 'Event') {
            history.push(`/event/${entry.id}`);
        }
        else {
            history.push(`/journal/edit/${entry.id}`);
        }
    }
    
    return (
        <Card className={classes.card} onClick={handleEdit} onMouseOver={() => setShadow('8px 4px 4px 0px lightgray')} onMouseOut={() => setShadow('2px 2px 7px 0px lightgrey')} style={{boxShadow: shadow}}>
            <CardActionArea>
                <CardHeader
                    avatar={
                        <Fab
                            style={{
                                backgroundColor: entry.extendedProps.tagColor,
                                minWidth: '20px',
                                maxWidth: '20px',
                                minHeight: '20px',
                                maxHeight: '20px'
                            }}
                            disabled={true}
                            disableFocusRipple={true}
                            disableRipple={true}
                            size='small'
                        >
                        </Fab>
                    }
                    title={<Typography style={{ fontWeight: 'bold' }}>{entry.title}</Typography>}
                    subheader={`${entryDate} | ${startTime} - ${endTime}`}
                />
                <CardContent>
                    <Typography variant='body2' component="p" display='block'>
                        {entry.extendedProps.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Typography variant='caption'>Tags: </Typography>
                    {
                        entry.extendedProps.tags.map((tag, idx) => {
                            let weight:any = 'normal';
                            if (tag.id === entry.extendedProps.primaryTagId)
                                weight = 'bold';
                            return (
                                <div key={entry.id + '-div-' + tag.id}>
                                    <Fab
                                        key={entry.id + '-fab-' + tag.id}
                                        style={{
                                            backgroundColor: tag.color,
                                            minWidth: '10px',
                                            maxWidth: '10px',
                                            minHeight: '10px',
                                            maxHeight: '10px'
                                        }}
                                        disabled={true}
                                        disableFocusRipple={true}
                                        disableRipple={true}
                                    >
                                    </Fab>
                                    <Typography 
                                        key={entry.id + '-typ-' + tag.id} 
                                        variant='caption' 
                                        style={{fontWeight: weight, marginLeft: '3px'}}
                                    >
                                        {tag.name}{entry.extendedProps.tags[idx+1] ? ',' : ''} 
                                    </Typography>
                                </div>
                            )
                        })
                    }
                </CardActions>
            </CardActionArea>
        </Card>
    )
}

export default EntryCard;