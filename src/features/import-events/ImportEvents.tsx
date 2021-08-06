import React, { FunctionComponent } from 'react';

import { Entry } from '../../@types';

import { createEntry } from '../../axios/entries';

import { parseIntoEvents } from '../../common/ical-parsing/IcalParsing';

import { BForm, BFileUpload, BSubmit } from 'mui-bueno';
import { Formik } from 'formik';
import { getEntryDuration } from '../../common/calendar-utils/CalendarUtils';
import { Card, Typography } from '@material-ui/core';


interface ImportEventsModalProps {
    userId: number;
    handleModalClose: () => void;
    modalOpen: boolean;
    addEntry: (entryId: number) => Promise<any>;
}

export const ImportEventsModal: FunctionComponent<ImportEventsModalProps> = (props) => {

    const [info, setInfo] = React.useState<Entry[]>([]);

    const handleSubmit = async (event: any) => {
        //const info: Entry[] = await parseIntoEvents(event.chosenFile)

        info.forEach(async (e) => {
            const createdEvent = await createEntry(e);
            const t = await props.addEntry(createdEvent.data.id!)
        });

        props.handleModalClose();

    }

    const initialVals = {
        chosenFile: new File([], '')
    };

    const parseEvents = async (e: any) => {
        console.log(e)
        const info: Entry[] = await parseIntoEvents(e.chosenFile)
        setInfo(info);
        console.log(info)

    }

    return (
        <React.Fragment>
            <h2>Import Events from Other Calendars</h2>
            <p> Select .ics file</p>
            <Formik
                initialValues={initialVals}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validate={parseEvents}
            >
                <BForm >
                    <BFileUpload
                        name={'chosenFile'}
                        fileType={['.ics']}
                    />

                    {
                        info.map(e => {
                            const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };

                            const startDate = new Date(e.startDateTime)
                            const endDate = new Date(e.endDateTime)
                            const startDateStr = startDate.toLocaleDateString('en-US', options);
                            const endDateStr = endDate.toLocaleDateString('en-US', options);

                            const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                            const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                            const spansMultiple = getEntryDuration(startDate, endDate) > 1 ? true : false;

                            return (
                                <Card style={{ padding: '.5em', margin: '1em' }} variant="outlined" key={`key-${e.title}`}>
                                    <Typography><b>{e.title}</b></Typography>
                                    <Typography noWrap className='subtitle'>

                                        {startDateStr + (spansMultiple ? ` - ${endDateStr}` : '') + ` | ${startTime} - ${endTime} `}
                                    </Typography>
                                </Card>
                            )
                        }

                        )
                    }
                    {info.length > 0 &&
                        <BSubmit>
                            Add Event
                        </BSubmit>
                    }
                </BForm>

            </Formik>
        </React.Fragment>
    );
}


