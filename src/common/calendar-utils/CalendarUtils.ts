import * as React from 'react';
import { useState, useEffect } from 'react';
import { CalendarEntry, Entry, EntryStoreObject, Tag, Year } from '../../@types';
import { getTagById } from '../../axios/tags';
import { getByBetweenDateTime } from '../../axios/entries';

// DAY/WEEK/MONTH UTILS

/**
 * Finds and returns the color of the primary tag of the entry, if there is no primary tag
 * return the first tag in the entry's tagId list, if there are no tags at all returns grey default.
 * 
 * @param tagIds list of tag ids for an entry
 * @returns the color of the first tag in entry's TagId list
 */
export async function getTagColor(tagIds: number[], primaryTagId: number | undefined) : Promise<string> {
    if (primaryTagId) {
        const tagResult = await getTagById(primaryTagId);
        return tagResult.data.color;
    }  
    // If event has tags
    else if (tagIds.length >= 1) {
        const tagResult = await getTagById(tagIds[0])
        return tagResult.data.color
    }
    else {
        //Default color if no tags
        return 'grey';
    }
}

/**
 * Uses an entry's tagIds to populate a list of Tags with the axios getTagById function.
 * 
 * @param tagIds list of tag ids for an entry
 * @returns list of Tags associated with the entry
 */
export async function getEntryTags(tagIds: number[]) : Promise<Tag[]> {
    if (tagIds.length >= 1) {
        const entryTags: Tag[] = [];
        tagIds.forEach(async (id) => {
            const tagResult = await getTagById(id);
            entryTags.push(tagResult.data);
        });
        return entryTags;
    } else {
        return [];
    }
}

/**
 * Converts an entry with our type "Entry" to a FullCalendar accepted type "CalendarEntry".
 * TagColor, EntryType, Description, and Tags (list) can be found in the "extendedProps".
 * 
 * @param entry the entry to be converted to a CalendarEntry
 * @returns the converted CalendarEntry
 */
export async function eventToCalEvent(entry: Entry) : Promise<CalendarEntry> {
    const tagColor = await getTagColor(entry.tagIds, entry.primaryTagId);
    const entryTags = await getEntryTags(entry.tagIds);

    return {
        id: String(entry.id),
        title: entry.title,
        start: entry.startDateTime,
        end: entry.endDateTime,
        extendedProps: {
            tagColor: tagColor,
            entryType: entry.entryType,
            description: entry.description,
            tags: entryTags,
            primaryTagId: entry.primaryTagId,
        },
        backgroundColor: tagColor,
        editable: true
    }
}

/**
 * Converts the passed date to a date string that can be correctly assigned to an Entry.
 * 
 * @param d date to be converted to a date string
 * @returns the converted date as a date string
 */
export function fixDateFormat(d: Date) : string {
    let day = String(d.getDate())
    let month = String(d.getMonth() + 1)
    const year = String(d.getFullYear())
    if (day.length < 2) {
        day = '0' + day
    }
    if (month.length < 2) {
        month = '0' + month
    }
    return [year, month, day].join('-')
}

/**
 * Converts the passed date to a string of the time that can be correctly assigned to an Entry.
 * 
 * @param d date to be converted to a time string
 * @returns the converted date as a time string
 */
export function fixTimeFormat(d: Date) : string {

    const dateTime = d.toLocaleTimeString();
    const ampm = dateTime.split(' ')[1];
    let time = dateTime.split(' ')[0].split(':');

    if (ampm === 'PM' && Number(time[0]) < 12) {
        time[0] = String(12 + Number(time[0]))
    }

    time = time.map(e => (e.length < 2 ? '0' + e : e));

    return 'T' + time.join(':')
}

/**
 * Converts passed date to a string of the dateTime that can be correctly assigned to an Entry.
 * Calls helper functions fixDateFormat(d) and fixTimeFormat(d)
 * 
 * @param d date to be converted to dateTime string
 * @returns the converted date as a dateTime string
 */
export function getDateTimeStr(d: Date) : string {
    return fixDateFormat(d)+fixTimeFormat(d);
}

// YEAR CALENDAR UTILS
// need to update to be 1 indexed and account for leap year with february
export const MONTHS = [
    { id: 0, name: 'January', numDays: 31 },
    { id: 1, name: 'February', numDays: 28 },
    { id: 2, name: 'March', numDays: 31 },
    { id: 3, name: 'April', numDays: 30 },
    { id: 4, name: 'May', numDays: 31 },
    { id: 5, name: 'June', numDays: 30 },
    { id: 6, name: 'July', numDays: 31 },
    { id: 7, name: 'August', numDays: 31 },
    { id: 8, name: 'September', numDays: 30 },
    { id: 9, name: 'October', numDays: 31 },
    { id: 10, name: 'November', numDays: 30 },
    { id: 11, name: 'December', numDays: 31 },
]

/**
 * Gets the full month name from given date
 * 
 * @param year 1 indexed
 * @param month 1 indexed
 * @param length the display length for formatting month 
 * @returns 
 */
export function getMonthName(year: number, month: number, length: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined) {
    const date = new Date(year, month);
    return date.toLocaleString('default', { month: length });
}

/**
 * Gets the number of days in a month for a given year
 * 
 * @param month the month: is 1 indexed in year calendar so pass in 1 indexed #, but 0 indexed in Date type
 * @param year the year: 1 indexed
 * @returns number of days
 */
export function numDaysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate(); // perhaps could be optimized if using Date object take too much time/space
}

export function isLeapYear(year: number) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

/** 
 * Gets the number of days an entry occurs (if single day entry, return 1, etc)
 * 
 * @param start start date of entry associated with entry
 * @param end end date of entry associated with entry
 * @returns length of entry
 */
export function getEntryDuration(start: Date, end: Date) : number {
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const startMonth = start.getMonth()+1; // month is 1 indexed
    const endMonth = end.getMonth()+1; // month is 1 indexed

    const startDate = start.getDate();
    const endDate = end.getDate();

    if (startYear == endYear) { // if entry start and end are in the same year
        if (startMonth == endMonth) { // if entry start and end are in the same month
            return endDate - startDate + 1;
        } else {
            let numDays = 0; // a count of the number of days an entry occurs
            
            const numMonths = endMonth - startMonth + 1; // number of months entry occurs
            for (let m=0; m<numMonths; m++) {
                if (m==0)
                    numDays += numDaysInMonth(startMonth, startYear) - startDate + 1;
                else if (m==numMonths-1)
                    numDays+= endDate;
                else
                    numDays += numDaysInMonth(startMonth+m, startYear);
            }
            return numDays;
        } 
    } else { // if entry start and end are in different years
        let numDays = 0;
        
        const numYears = endYear - startYear + 1; // number of years entry occurs
        for (let y=0; y<numYears; y++) { // for each year the entry occurs
            if (y==0) { // if year index is first year of entry duration
                const numMonths = 12 - startMonth + 1;
                for (let m=0; m<numMonths; m++) {
                    if (m==0)
                        numDays += numDaysInMonth(startMonth, startYear) - startDate + 1;
                    else
                        numDays += numDaysInMonth(startMonth+m, startYear);
                }
            } else if (y==numYears-1) { // if year index is last year of entry duration
                for (let m=1; m<=endMonth; m++) {
                    if (m==endMonth)
                        numDays += endDate;
                    else
                        numDays += numDaysInMonth(m, endYear);
                }
            } else { // if year index is any other year
                if (isLeapYear(startYear+y)) // if leap year
                    numDays+=366;
                else
                    numDays+=365;
            }
        }
        return numDays;
    }
}

/**
 * Returns either true or false if the checkDate is in the range between startDate and endDate.
 * 
 * @param startDate start date (lower bound) of the range of dates to check
 * @param checkDate date to be checked if it is in between startDate & endDate
 * @param endDate end date (upper bound) of the range of dates to check
 * @returns 
 */
export function isBetweenDates(startDate: string, checkDate: string, endDate: string) : boolean {
    const results:string[][] = [];
    const dates:string[] = [startDate, checkDate, endDate];

    for (let i = 0; i < 3; i++) {
        const d = new Date(dates[i]);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        const date = [day, month, year].join('-');
        results.push(date.split('-'));
    }

    const from = new Date(parseInt(results[0][2]), parseInt(results[0][1]) - 1, parseInt(results[0][0]));
   
    const to = new Date(parseInt(results[2][2]), parseInt(results[2][1]) - 1, parseInt(results[2][0]));
    
    const check = new Date(parseInt(results[1][2]), parseInt(results[1][1]) - 1, parseInt(results[1][0]));
    

    return (check >= from && check < to);
}

/**
 * Returns either true or false if today's date is in the range between startDate and endDate.
 * 
 * @param startDate start date (lower bound) of the range of dates to check
 * @param endDate end date (upper bound) of the range of dates to check
 * @returns 
 */
export const isTodayInView = (startDate: string, endDate: string) => {
    const today = getTodayString();

    // If today's date is present in the currently rendered dates, then set the state to the current date
    if (isBetweenDates(startDate, today, endDate))
        return true;
    else
        return false;
}

/**
 * Returns today's date in the form of a string 'yyyy-mm-dd'
 */
export const getTodayString = () => {
    const curr = new Date();
    const dd = String(curr.getDate()).padStart(2, '0');
    const mm = String(curr.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = curr.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}


export const getYearEntries = async (userId: string, year: string) => {
    // jan 1 and dec 31 for the given year
    const end = new Date(parseInt(year), 11, 31)
    const start = new Date(parseInt(year), 0, 1)
    const res = await getByBetweenDateTime(start.toISOString(), end.toISOString(), userId)

    return res.data;
}

export function useSingleAndDoubleClick(handleSingle: () => void, handleDouble: () => void) {
    // state
    const [click, setClick] = React.useState(0);

    // vars
    const delay = 250;

    // effects
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (click === 1)
                handleSingle();
            setClick(0);
        }, delay);

        // the duration between this click and the previous one
        // is less than the value of delay = double-click
        if (click === 2)
            handleDouble();

        return () => clearTimeout(timer);
    }, [click]);

    return () => setClick(prev => prev + 1);
}