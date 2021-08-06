import React, { FunctionComponent } from 'react';

import {Recurrence} from '../../@types';
import {createRecurrence} from '../../axios/recurrence';

import { BForm, BSelect, BOption, BSubmit, BTextField, BDatePicker, BRadioGroup, BRadio} from 'mui-bueno';
import { Chip } from '@material-ui/core';
import { Formik } from 'formik';
import * as yup from 'yup';
import { updateEntry } from '../../axios/entries';

const TIMES = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
    DAY: 'day(s)',
    WEEK: 'week(s)',
    MONTH: 'month(s)',
    YEAR: 'year(s)',
    SUNDAY: 'Sunday',
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    REPEAT: 'Repeat Every',
    ON: 'On',
    ENDS: 'Ends'
}

const recurrenceSchema = yup.object().shape({
    type: yup.string().required('Required'),
    every: yup.number().required('Required').positive('Frequency must be positive').integer(),
    weekSelect: yup.array().test({
        name: 'daysSelected',
        exclusive: false,
        params: { },
        message: 'Please select at least one day',
        test: function (value:any) {
            if(this.parent.type === TIMES.WEEKLY || this.parent.type === TIMES.MONTHLY ){
                if (value.length === 0){
                    return false
                }
            }
            return true
        },
    }),
    ending: yup.string().required('Required'),
    endDate: yup.date()
});

export const SetRecurrence: FunctionComponent = () => {


    const [showWeeks, setShowWeeks] = React.useState<boolean>(false);
    const [showEndDate, setShowEndDate] = React.useState<boolean>(false);
    const [everyType, setEveryType] = React.useState<string>(TIMES.DAY);

    const frequency: BOption<string>[] = [
        { value: TIMES.DAILY, label: TIMES.DAY },
        { value: TIMES.WEEKLY, label: TIMES.WEEK },
        { value: TIMES.MONTHLY, label: TIMES.MONTH },
        { value: TIMES.YEARLY, label: TIMES.YEAR }];

    const daysOfWeek: BOption<string>[] = [
        { value: '0', label: TIMES.SUNDAY },
        { value: '1', label: TIMES.MONDAY },
        { value: '2', label: TIMES.TUESDAY },
        { value: '3', label: TIMES.WEDNESDAY },
        { value: '4', label: TIMES.THURSDAY },
        { value: '5', label: TIMES.FRIDAY },
        { value: '6', label: TIMES.SATURDAY }];
    
    const ending: BRadio<string>[] = [
        {label: 'Never', value: 'Never'},
        {label: 'On', value: 'On'}];   

    const handleTypeChange = (event: React.ChangeEvent<{ name?: string, value: any }>, value: any) => {
        switch (value) {
        case TIMES.DAILY:
            setEveryType(TIMES.DAY);
            setShowWeeks(false);
            break;
        case TIMES.WEEKLY:
            setEveryType(TIMES.WEEK);
            setShowWeeks(true);
            break;
        case TIMES.MONTHLY:
            setEveryType(TIMES.MONTH);
            setShowWeeks(true);
            break;
        case TIMES.YEARLY:
            setEveryType(TIMES.YEAR);
            setShowWeeks(false);
            break;
        }

    }
   
    const handleChange = (event: any) => {
        setShowEndDate(event.target.value === 'On');
    }

    const initialVals = {
        type: TIMES.DAILY, 
        every: 1,
        endDate: new Date(),
        weekSelect: [],
        ending:'Never'
    }

    const handleSubmit = (data: any) => {
        const entryId = 1 //TODO: get EntryId from event
        const recur:Recurrence = {
            id: undefined, 
            entryId: entryId, 
            type: data.type,
            every: data.every,
            endDate: '',
            occurrence:''};
        if (data.ending === 'On'){
            recur.endDate = data.endDate
        }
        if (data.type === TIMES.MONTHLY || data.type === TIMES.WEEKLY) {
            recur.occurrence = String(data.weekSelect)
        }
        createRecurrence(recur).then(res => {
            console.log(res.data);
        });

    }    

    return (
        <React.Fragment>

            <Formik
                initialValues={initialVals}
                onSubmit={handleSubmit}
                validationSchema={recurrenceSchema}
                validateOnChange={false}
            >
                <BForm>
                    {TIMES.REPEAT}     
                    <BTextField
                        name={'every'}
                        label={''}
                        inputProps={{ type: 'number' }}
                    />
                    <BSelect
                        name={'type'}
                        label={''}
                        options={frequency}
                        placeholder={'Select Type'}
                        onChange={handleTypeChange}
                    />
                    
                    {showWeeks && TIMES.ON}
                    {showWeeks  &&
                        <BSelect
                            name={'weekSelect'}
                            label={''}
                            options={daysOfWeek}
                            multiple
                            placeholder={'Select Days To Repeat'}
                            renderValue={selected => (
                                <div>
                                    {(selected as number[]).map(value => {
                                        const chip = daysOfWeek[value];
                                        return (
                                            chip &&
                                            <Chip
                                                key={`tag-${chip.value}`}
                                                label={chip.label}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        />}
                    
                    {everyType && TIMES.ENDS}
                    <BRadioGroup 
                        name='ending'
                        radios={ending}
                        label=''
                        onChange={handleChange}
                        fullWidth
                    />

                    { showEndDate && 
                        <BDatePicker
                            name={'endDate'}
                        />
                    }

                    <BSubmit> Submit </BSubmit>
                </BForm>
            </Formik>
        </React.Fragment>
    );
};