import React from 'react';
import { CalendarEntry } from '../../@types';
import { Popover } from '@material-ui/core';
import EntryCard from './EntryCard';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
    entry: CalendarEntry,
    displayPopover: boolean,
    handleCloseEventPopover: () => void,
    anchorEl: HTMLButtonElement | null,
}

const EntryPopover: React.FC<Props> = ({entry, displayPopover, handleCloseEventPopover, anchorEl}: Props) => {

    return (
        <>      
            <Popover
                id={'pop-' + String(entry.id)}
                onClose={handleCloseEventPopover}
                open={displayPopover}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                style={{ zIndex: 4 }}
            >
                <EntryCard entry={entry}/>
            </Popover>
        </>
    )
}

export default EntryPopover;