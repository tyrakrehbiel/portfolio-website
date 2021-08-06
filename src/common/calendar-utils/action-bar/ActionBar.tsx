import * as React from 'react';

import { Grid, Box , Button, IconButton, Typography} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add'; 
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

import CustomButtonGroup from './custom-button-group/CustomButtonGroup';
import YearTagMenuFilter from '../../../features/tag-menu-filter/YearTagMenuFilter';
import AddEntryMenu from '../add-entry-menu/AddEntryMenu';
import {Entry, Tag } from '../../../@types';
import './_ActionBar.scss';

interface Props {
    currentYear: number,
    handleNextYear: () => void,
    handlePrevYear: () => void,
    handleToday: () => void,
    addEntryToUser: (entryId: number) => Promise<any>, // to pass onto addEntryMenu
    updateCalendar: (entry : Entry) => void, //pass to addEntryMenu
    applyFilters: (types:string[], tagList:Tag[]) => void;
    applyTitleToggles: ( showAll: boolean, types?: string[], tagIds?: number[]) => void,
    toggleWeekendOnView: (show: boolean) => void;
}

const ActionBar: React.FunctionComponent<Props> = props => {
    
    // states
    const [showEntryMenu, setShowEntryMenu] = React.useState<boolean>(false);
    const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    
    // const
    //const addBtnEl = React.useRef(null);
    const entryMenuAnchor = document.getElementById('add-entry');
   
    const handleOpenFilter = (event:React.MouseEvent<HTMLButtonElement>) => {
        setFilterAnchorEl(event.currentTarget);
    }

    const handleCloseFilter  = () => {
        setFilterAnchorEl(null);
    }
    

    const toggleEntryMenu = () => {
        setShowEntryMenu(showEntryMenu ? false : true);
    }

    return(
        <Grid item xs={11} className= 'calendar-action-bar grid'>
            <Box className='calendar-year-selector'>
                <IconButton 
                    aria-label='previous' 
                    onClick={props.handlePrevYear}
                > 
                    <KeyboardArrowLeftIcon className = 'prev-next-buttons'/> 
                </IconButton>
                <Typography className='year-typography'> 
                    {`${String(props.currentYear)}`} 
                </Typography>
                <IconButton 
                    aria-label='next' 
                    onClick={props.handleNextYear}
                > 
                    <KeyboardArrowRightIcon className = 'prev-next-buttons'/>
                </IconButton>
            </Box>
            <Box className='right-action-group'>
                <CustomButtonGroup 
                    buttons={[
                        { name: 'Day', to: '/day' }, 
                        { name: 'Week', to: '/week' }, 
                        { name: 'Month', to: '/month'}, 
                        { name: 'Year', to: '/year' , isSelected: true }, 
                    ]}
                />
                <Button 
                    variant='outlined' 
                    className='outlined-buttons today-button' 
                    size= 'small' 
                    onClick={props.handleToday}
                >
                    Today
                </Button>
                <Button 
                    id='add-entry'
                    variant='outlined' 
                    className='outlined-buttons add-button' 
                    size= 'small' 
                    onClick={toggleEntryMenu}
                    startIcon={<AddIcon className='add-icon'/>}
                >
                    Add Entry
                </Button>
                {/*<Switch checked={showTitles} onChange={() => {setShowTitles(!showTitles)}}></Switch>*/}
                <IconButton 
                    className= 'calendar-icon-buttons' 
                    aria-label='search'
                >
                    <SearchIcon fontSize='small'/>
                </IconButton>
                <IconButton 
                    className= 'calendar-icon-buttons'
                    aria-label='filter' 
                    onClick={handleOpenFilter}
                >
                    <FilterListIcon fontSize="small"/>
                </IconButton>
            </Box>
            <AddEntryMenu 
                showEntryMenu={showEntryMenu} 
                toggleEntryMenu={toggleEntryMenu}
                entryMenuAnchorEl={entryMenuAnchor}
                addEntryToUser={props.addEntryToUser}
                updateCalendar={props.updateCalendar}
            />
            <YearTagMenuFilter anchorEl={filterAnchorEl} handleClose={handleCloseFilter} applyFilters={props.applyFilters} toggleWeekendOnView={props.toggleWeekendOnView} applyTitleToggles={props.applyTitleToggles}/>
        </Grid>
    )
}

export default ActionBar;