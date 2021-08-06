import { BOption, BRadio } from 'mui-bueno';
import { Tag } from '../../@types';

export const TIMES = {
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

export const frequency: BOption<string>[] = [
    { value: TIMES.DAILY, label: TIMES.DAY },
    { value: TIMES.WEEKLY, label: TIMES.WEEK },
    { value: TIMES.MONTHLY, label: TIMES.MONTH },
    { value: TIMES.YEARLY, label: TIMES.YEAR }
];

export const daysOfWeek: BOption<string>[] = [
    { value: '0', label: TIMES.SUNDAY },
    { value: '1', label: TIMES.MONDAY },
    { value: '2', label: TIMES.TUESDAY },
    { value: '3', label: TIMES.WEDNESDAY },
    { value: '4', label: TIMES.THURSDAY },
    { value: '5', label: TIMES.FRIDAY },
    { value: '6', label: TIMES.SATURDAY }
];

export const ending: BRadio<string>[] = [
    { label: 'Never', value: 'Never' },
    { label: 'On', value: 'On' }
];



export const validationValues = {
    //entry fields
    title: '',
    id: undefined,
    recurrenceId: undefined,
    entryType: 'Event',
    start: new Date(),
    startDateTime: '2021-06-22T07:30:00',
    endDateTime: '2021-07-22T10:30:00',
    startDate: new Date(),
    startTime: 'T07:30:00',
    endDate: new Date(),
    endTime: 'T10:30:00',
    description: '',
    location: '',
    fieldList: '',
    fields: '',
    tagIds: [],
    imageStoreIds: [],
    fileOne: new File([], ''),
    recurr: false,
    recurrType: TIMES.DAILY,
    every: 1,
    endRecurr: new Date('2021-06-22T00:00'),
    weekSelect: [],
    ending: 'Never',
    email: ''
}


/**
* creates list of values to be added to the tags field
* @returns list for tags options
*/
export const createTagList = (tags: Tag[]) => {
    const allTags: BOption<string>[] = [];
    tags.forEach(tag => {
        if (tag.id) {
            allTags.push({ value: tag.id.toString(), label: tag.name });
        }
    });
    return allTags;
}

export const convertUTCDateToLocalDate =  (date : Date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),  date.getHours(), date.getMinutes(), date.getSeconds()));
}