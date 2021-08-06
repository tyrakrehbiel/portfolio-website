// Authorization/Authentication
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface DecodedToken {
    sub: string,
    iat: number,
    exp: number,
    permissions: string[],
    id: number,
    firstName: string,
    lastName: string,
    email: string
}

export interface User {
    id: number | undefined;
    email: string;
    firstName: string;
    lastName: string;
    password: string | undefined;
    tagIds: number[] | undefined;
    entryIds: number[] | undefined;
}

// Tags
export interface Tag extends Record<string, any>{  
    id: number | undefined,
    name: string,
    color: string,
    fieldList: string
}

export interface TagField{
    type: string,
    body: string
}
  
// Entries
export interface Entry extends Record<string, any>{  
    id: number | undefined,
    title: string,
    recurrenceId: number | undefined,
    entryType: 'Event' | 'Journal' | '', // empty string for initial values
    startDateTime: string,
    endDateTime: string,
    description: string,
    location: string,
    fieldList: string,
    tagIds: number[],
    imageStoreIds: number[],
    primaryTagId: number | undefined
}

export interface Recurrence {  
    id: number | undefined,
    entryId: number,
    type: string,
    endDate: string, // NEEDS TO BE ENDDATETIME
    occurrence: string,
    every: int
}

export interface EntryField{
    type: string,
    body: string
}

export interface EntryPage {
    list: Entry[]
    page: number
    total: number
}

export interface ImageStore {
    id: number | undefined,
    filename: string,
    image: byte[]
}

// Full Calendar Types
export interface CalendarEntry {
    id: string | undefined,
    title: string,
    start: string,
    end: string | undefined,
    extendedProps: {
        tagColor: string,
        entryType: string,
        description: string,
        tags: Tag[],
        primaryTagId: number | undefined,
    }
    backgroundColor: string, // used for day/week colors
    editable: boolean
    // potentially need to add location now that Entry has location
}

export interface EntryField{
  type: string,
  body: string
}

export interface ImageStore {
  id: number | undefined,
  filename: string,
  image: byte[]
}
export interface Recurrence {  
  id: number | undefined,
  entryId: number,
  type: string,
  endDate: string,
  occurrence: string,
  every: int
}

export interface Attendee extends Record<string, any>{
    id: number | undefined,
    email: string,
    response: string,
    entryId: number
}

export interface SelectedDate {
    date: string
}

export interface Month {
    [key: string]: Entry[]
}

export interface Year {
    [key: string]: {
        [key: string]: Entry[]
    }
}

export interface EntryStoreObject {
    [key: string]: {
        [key: string]: Entry[]
    }
}
