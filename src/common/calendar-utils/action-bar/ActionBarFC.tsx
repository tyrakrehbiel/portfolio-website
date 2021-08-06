import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, Box, Button, IconButton, Typography } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

import CustomButtonGroup from './custom-button-group/CustomButtonGroup';
import TagMenuFilter from '../../../features/tag-menu-filter/TagMenuFilter';
import { CalendarEntry, Tag } from '../../../@types';
import './_ActionBarFC.scss';

interface Props {
    onAddEntry: (instance: React.MutableRefObject<null>) => void
    currView: 'YEAR' | 'MONTH' | 'WEEK' | 'DAY'
    dateTitle: string
    currentYear: number;
    handleNext: () => void;
    handlePrev: () => void;
    applyFilters: (types:string[], tagList:Tag[]) => void;
    entries?: CalendarEntry[];
    viewUpdated: boolean;
    today?: () => void;
}

const ActionBar: React.FunctionComponent<Props> = props => {
    const addBtnEl = React.useRef(null);
    const { onAddEntry, currView, dateTitle, handleNext, handlePrev, applyFilters, entries, viewUpdated, today } = props
    const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    
    const handleOpenFilter = (event:React.MouseEvent<HTMLButtonElement>) => {
        setFilterAnchorEl(event.currentTarget);
    }

    const handleCloseFilter  = () => {
        setFilterAnchorEl(null);
    }

    const history = useHistory()

    return (
        <>
            <Grid item xs={12} className='calendar-action-bar grid'>
                <Box className='calendar-year-selector'>
                    <IconButton aria-label='previous' onClick={handlePrev}>
                        <KeyboardArrowLeftIcon className='prev-next-buttons' />
                    </IconButton>
                    <Typography className='year-typography'>
                        {dateTitle}
                    </Typography>
                    <IconButton aria-label='next' onClick={handleNext}>
                        <KeyboardArrowRightIcon className='prev-next-buttons' />
                    </IconButton>
                </Box>
                <Box className='right-action-group'>
                    <CustomButtonGroup
                        buttons={[
                            { name: 'Day', to: '/day', isSelected: currView === 'DAY' },
                            { name: 'Week', to: '/week', isSelected: currView === 'WEEK' },
                            { name: 'Month', to: '/month', isSelected: currView === 'MONTH' },
                            { name: 'Year', to: '/year', isSelected: currView === 'YEAR' },
                        ]}
                    />
                    <Button variant='outlined' className='outlined-buttons today-button' size='small' onClick={today}>Today</Button>
                    <Button ref={addBtnEl} variant='outlined' className='outlined-buttons add-button' size='small' onClick={() => onAddEntry(addBtnEl)} startIcon={<AddIcon className='add-icon' />}>Add Entry</Button>
                    {/*<Switch checked={showTitles} onChange={() => {setShowTitles(!showTitles)}}></Switch>*/}
                    <IconButton className='calendar-icon-buttons' aria-label='search'>
                        <SearchIcon fontSize='small' />
                    </IconButton>
                    <IconButton className='calendar-icon-buttons' aria-label='filter' onClick={(e) => handleOpenFilter(e)}>
                        <FilterListIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Grid>
            <TagMenuFilter anchorEl={filterAnchorEl} handleClose={handleCloseFilter} applyFilters={applyFilters} entries={entries} viewUpdated={viewUpdated}/>
        </>
    )
}

export default ActionBar;