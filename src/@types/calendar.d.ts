import { Entry } from './index'

// 365 Calendar Types
// Cell position on grid
export interface CellPosition {
    yearIdx: number,
    monthIdx: number,
    dayIdx: number,
}

// Horizontal, vertical, dot, and placeholder objects
export interface Blob {
    id: number,
    entryId: number,
    position: CellPosition,
    seatNumber: number,
    duration: number,
    color: string,
    hasGroup: boolean,
    isTop: boolean,
}

// Cell representing a day
export interface DayCell {
    position: CellPosition
    ref: React.MutableRefObject<null>,
}

// Column representing a month
export interface MonthColumn {
    monthId: number,
    dayCells: DayCell[]
}

// Properties of Cell
export interface CellProps {
    position: CellPosition,
    blobs: Blob[],
    cellCapacity: number,
    showWeekends: boolean,
    ref: React.MutableRefObject<null>,
    today: Date,
    hasPreviewOpen: boolean,
    isDragging: boolean,
    displayTitle: (entryId: number) => boolean,
    setPreviewOpened: (position: CellPosition | undefined) => void,
    addEntryToUser: (entryId: number) => Promise<any>,
    updateCalendar: (entry: Entry) => void,
    onDragStart: (yearIdx: number, monthIdx: number, dayIdx: number) => void,
    onDragEnd: (_: any, info: any, entry:Entry) => void,
    getEntry: (id: number) => Entry | undefined,
    calendarLink: (type: 'month' | 'day', month: number, day?: number) => void,
}

// Properties of Draggable
export interface DraggableProps {
    id: number,
    blob: Blob,
    renderStyle: 'dot' | 'horizontal' | 'vertical' | 'placeholder',
    isDragging: boolean,
    displayTitle: (entryId: number) => boolean,
    onDragStart: (yearIdx: number, monthIdx: number, dayIdx: number) => void,
    onDragEnd: (_:any, info: any, entry: Entry) => void, 
    getEntry: (id: number) => Entry | undefined,
    handleOpenPreview: () => void,
    handleClosePreview: () => void,
}

export interface EntryColor{
    entry: Entry,
    color: string,
}

// Properties of EntryPreview
export interface EntryPreviewProps {
    preview: EntryColor,
    isOpened: boolean,
    setOpened: (entryId: number | undefined) => void,
}

export interface DayPreviewProps {
    entryPreviews: EntryColor [],
    position: CellPosition,
    handleClosePreview: () => void,
    addEntryToUser: (entryId: number) => Promise<any>,
    updateCalendar: (entry: Entry) => void,
}

export interface DateRange {
    'start': Date,
    'end': Date
}