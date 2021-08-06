import React, { FunctionComponent } from 'react';
import { Attendee } from '../../@types/index';
import { addAttendee, getAttendeesByEntry } from '../../axios/attendee';
import { Card, Chip, TextField, Typography } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HelpIcon from '@material-ui/icons/Help';
import './_FullEvent.scss';


interface props {
    entryId: number | undefined,
    submit: boolean
}

export const AttendeeEdit: FunctionComponent<props> = (props) => {

    const [existingAttendees, setExistingAttendees] = React.useState<Attendee[]>();

    // Used to collect attendee information
    const [emails, setEmails] = React.useState<string[]>([]);
    const [errorEmail, setErrorEmail] = React.useState<string>('');
    const [valueEmail, setValueEmail] = React.useState<string>('');

    React.useEffect(() => {
        if (!props.entryId)
            return
        getAttendeesByEntry(props.entryId).then((res) => {
            console.log(res.data)
            setExistingAttendees(res.data)
        })
    }, []);

    React.useEffect(() => {
        (async () => {
            if (props.submit) {
                emails.forEach(async e => {
                    const attendee = await addAttendee({
                        id: undefined,
                        email: e,
                        entryId: props.entryId || 0,
                        response: 'SENT'
                    })
                })
            }
        })()
    }, [props.submit]);

    /**
     * on enter adds email to attendees list
     * @param e email to be added
     */
    const onKeyDownEmail = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateAddEmail(e.target.value)
        }
    }

    /**
     * check if email format is valid
     * add it to list if valid
     * throw errors otherwise
     * @param data check if email format is valid
     * 
     */
    const validateAddEmail = (data: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // checking email format
        if (re.test(String(data).toLowerCase())) {

            // checking if email has already been added
            if (!emails.find(e => e === data) && !(existingAttendees?.find(e => e.email === data))) {
                setEmails([...emails, data])
                setErrorEmail('')
                setValueEmail('')

            }
            else {
                setErrorEmail('Email already added')
            }
        } else {
            setErrorEmail('Email invalid')
        }

    }

    /**
     * removes email from list
     * @param name email to be removed
     * 
     */
    const removeEmail = (name: string) => {
        return (event: any) => {
            setEmails(emails.filter(e => e !== name))
        };
    };

    /**
     *  returns icon based on response
     * @param resp response type
     * @returns icon based on invite response
     */
    const responseIcon = (resp: string) => {
        return (resp === 'ACCEPT' && <CheckCircleIcon className={'attendee-response-accept'}/>) ||
            (resp === 'DECLINE' && <CancelIcon className={'attendee-response-decline'}/>) ||
            (<HelpIcon/>)

    }

    /**
     * on lose focus adds email to attendees list
     * @param e email to be added
     */
    const attendeeOnBlur = (e: any) => {
        e.preventDefault();
        if (e.target.value === '') {
            setErrorEmail('');
            return;
        }
        validateAddEmail(e.target.value)
    }

    return (
        <React.Fragment>
            <Card className='attendees' elevation={5}>
                <Typography variant="h6" component="h2"> Attendees </Typography>
                <TextField
                    name='email'
                    onKeyDown={onKeyDownEmail}
                    error={!!errorEmail}
                    helperText={errorEmail}
                    placeholder={'Add Attendees By Email'}
                    value={valueEmail}
                    onChange={(e) => { setValueEmail(e.target.value) }}
                    onBlur={attendeeOnBlur}
                    variant='outlined'
                    style={{ padding: '6px', width: '100%' }}
                />

                <div className={'attendee-list-view attendee-left-col'}>
                    <Typography className='attendee-sub-title'><b> Current Attendees </b> </Typography>
                    {existingAttendees?.map(member => (
                        <Chip className={'attendee-chip'}
                            key={`attendee-${member.email}`}
                            label={`${member.email}`}
                            icon={responseIcon(member.response)} />
                    ))}
                </div>

                <div className={'attendee-list-view attendee-right-col'}>
                    <Typography className='attendee-sub-title'><b>New Attendees </b></Typography>
                    {
                        emails.map(value => {
                            return (
                                <Chip
                                    className={'attendee-chip'}
                                    key={value}
                                    label={value}
                                    onDelete={removeEmail(value)}
                                />
                            );
                        })
                    }
                </div>
            </Card>
        </React.Fragment>
    )

};