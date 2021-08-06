import React from 'react';
import { Card, Box, CardMedia, Button, CardActions, Dialog, CardContent, Typography, Chip, Modal, Input, Grid, TextField, TextFieldProps } from '@material-ui/core';
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateFnsUtils from '@date-io/date-fns';

interface Props {
    init?: string
    spaceFrom?: string
    onChange?: (date: MaterialUiPickersDate) => void;
    labelDate?: string
    labelTime?: string
    dateError?: boolean
    defaultDate?: Date //option to set the date to dayClick

}
/** 
 * 
 * All are optional, although your pickers will not work if you do not include onChange
 * @param init: string for a date (eg '2021-06-22T10:30:00'), used to set the inital date selected
 * @param spaceFrom: string for a date (eg '2021-06-22T10:30:00'), if this value is passed in,
 * the date will update when this date is changed to maintain space from it
 * @param onChange: handles setting the date/time in the parent when the date or time picker ui is changed
 * @param labelDate: label for the date picker
 * @param labelTime: label for the time picker
 * @param dateError: this sets errors within the text field - parent should set if it recognizes
 * end time is happening before start time
 * @param defaultDate has same effect as init but is a date instead of a string
 * 
 */
export const DateTimePickers: React.FC<Props> = ({ init, spaceFrom, onChange, labelDate, labelTime, dateError, defaultDate}) => {

    const [date, setDate] = React.useState<Date>(defaultDate? defaultDate : new Date());

    //timeFrom is the space this date must keep form the other date 
    // if this date was given spaceFrom, a date to keep space from
    // default spacing from other date is 1 hour
    const [timeFrom, setTimeFrom] = React.useState<number>(3600000);
    const [firstTime, setFirstTime] = React.useState<boolean>(true)



    // sets intial data on start up - also sets spaceFrom if using init for an end 
    //instead of defaul 1 hour
    React.useEffect(() => {
        if (init) {

            const initDate = new Date(init)

            setDate(initDate);
            if (spaceFrom){

                const spaceDate = new Date(spaceFrom)
                setTimeFrom(initDate.getTime() - spaceDate.getTime())
            }
        }

    }, []);

    React.useEffect(() => {
        if (spaceFrom && (!firstTime || !init)) {

            //space date is the date we're trying to maintian distance from
            //(created from the date string spaceFrom)
            const spaceDate = new Date(spaceFrom)
            //we are changing to adjustedDate, the spaceDate plus the time we need
            //to maintina from it
            const adjustedDate = new Date(spaceDate.getTime() + timeFrom)
            // update our date internally and then update the parent
            setDate(adjustedDate);
            handleChange(adjustedDate)
        }
        setFirstTime(false)

    }, [spaceFrom]);



    const handleChange = (newTime: MaterialUiPickersDate, value?: string | null) => {
        if (newTime) {
            
            if (spaceFrom) {
                //if you're maintinaing space, then when you're date is changed
                //the space you must maintain from the other date is also changed
                const spaceDate = new Date(spaceFrom)
                setTimeFrom(newTime.getTime() - spaceDate.getTime())
            }
            //we convert to Local date before sending to the external function
            setDate(newTime);
            const time2 = convertUTCDateToLocalDate(newTime)

            if (onChange) {
                onChange(time2);
            }
        }
    }

    const convertUTCDateToLocalDate = (date: Date) => {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }

    /*
    // eg 2021-07-28T17:15:33 -> Wed Jul 28 2021 13:15:33 GMT-0400 (EDT)
    const UTCtoLocalTimeString = (newTime: string) => {
        const time2 = new Date(newTime);
        const offset = time2.getTimezoneOffset();

        const offsetHours = offset / 60;
        const hours = time2.getHours();
        const newHours = (24 + hours - offsetHours) % 24;
        time2.setHours(newHours);


        const offsetMinutes = offset % 60;
        const minutes = time2.getMinutes();
        const newMinutes = (60 + minutes - offsetMinutes) % 60;
        time2.setMinutes(newMinutes);
        return time2
    }
    */


    return (
        <Box className='date-time-picker'>
            <Grid style={{
                display: 'flex',
                flexWrap: 'nowrap'
            }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        value={date}
                        label={labelDate}
                        format='MM/dd/yyyy'
                        onChange={handleChange}
                        helperText={(dateError) ? 'End cannot be before start' : ''}
                        error={dateError}
                        name="start"
                    />
                    <KeyboardTimePicker
                        value={date}
                        label={labelTime}
                        mask="__:__ _M"
                        onChange={handleChange}
                        error={dateError}
                        name="start"
                    />
                </MuiPickersUtilsProvider>
            </Grid>
        </Box >
    )
}

export default DateTimePickers;
