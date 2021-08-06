import { Entry } from '../../@types';

import { fixDateFormat, fixTimeFormat } from '../calendar-utils/CalendarUtils';

import ical from 'ical';


/**
 * Reads in events from .ics file and opens
 * and reads as string
 * 
 * @param file  .ics file object
 * @returns string of calendar information
 */
export const getContentFromICS = (file: File): Promise<any> => {

    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException('Problem parsing input file.'));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(file);
    });
}

/**
 * parses input of string to list of events 
 * to be added to user's calendar
 * @param file takes .ics file read string
 * @returns list of event objects
 */
export const parseIntoEvents = async (file: File): Promise<Entry[]> => {

    const fileContents = await getContentFromICS(file);

    const parsed = ical.parseICS(fileContents)

    const events: Entry[] = []
    for (const e in parsed) {
        const ev: Entry = {
            title: parsed[e].summary!,
            id: undefined,
            startDateTime: '',
            endDateTime: '',
            recurrenceId: 0,
            entryType: 'Event',
            description: '',
            fieldList: '',
            imageStoreIds: [],
            tagIds: [],
            location: '',
            primaryTagId: undefined,
        }

        ev.startDateTime = fixDateFormat(parsed[e].start!) + fixTimeFormat(parsed[e].start!)

        ev.endDateTime = (parsed[e].end ? fixDateFormat(parsed[e].end!) + fixTimeFormat(parsed[e].end!) : '')

        ev.description = parsed[e].description!

        ev.location = parsed[e].location!

        // UID 
        if (ev.description.length > 0) {
            ev.description = ev.description + '\n'
        }
        ev.description = ev.description + 'UID: ' + parsed[e].uid

        events.push(ev)

    }

    return events

}

