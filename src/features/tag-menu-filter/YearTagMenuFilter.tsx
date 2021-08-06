import React from 'react';
import { Button, Typography, Popover, Checkbox, Switch} from '@material-ui/core';

import { useAppSelector } from '../../store/hooks';
import AddIcon from '@material-ui/icons/Add';

import CircleChecked from '@material-ui/icons/CheckCircle';

import { Tag, CalendarEntry } from '../../@types';
import { getUserTags } from '../../axios/tags';
import { addUserTag } from '../../axios/user';
import FilledCircleUnchecked from './FilledCircleUnchecked';
import QuickCreateTag from '../quick-create-tag/QuickCreateTag';

import './_YearTagMenuFilter.scss';

interface Props {
    anchorEl: HTMLButtonElement | null,
    handleClose: () => void,
    applyFilters: (types:string[], tagList:Tag[]) => void,
    applyTitleToggles: ( showAll: boolean, types?: string[], tagIds?: number[]) => void,
    toggleWeekendOnView: (show: boolean) => void,
    entries?: CalendarEntry[],
    viewUpdated?: boolean
}

/**
 * @param anchorEl the html element for the menu to open under (opens on center bottom)
 * @param handleClose passed in function that closes the popover completely (this should just be setting anchorEl to null)
 * @param applyFilters the function that is called whenever one of the filters is chosen. Can be handled however the parent wants.
 * @param entries (OPTIONAL) the list of entries that the parent is currently using, added only for flexibility
 * @param viewUpdated a boolean that, when changed, calls the applyFilters in the parent
 */
const YearTagMenuFilter:React.FC<Props> = ({anchorEl, handleClose, applyFilters, toggleWeekendOnView , applyTitleToggles ,entries, viewUpdated}: Props) => {

    const [tags, setTags] = React.useState<Tag[]>([]);
    const [switchOn, setSwitches] = React.useState<boolean[]>([]); // Array that corresponds to each eye icon button on the menu
    const [checkClicked, setCheckClicked] = React.useState<boolean[]>([]); // Array that corresponds to each check icon button on the menu
    const [showWeekend, toggleWeekend] = React.useState<boolean>(true);
    const [showAllTitles, toggleShowAllTitles] = React.useState<boolean>(true);
    const [shouldUpdate, setShouldUpdate] = React.useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [filterTagList, setFilterTagList] = React.useState<Tag[]>([]); // List of Tags that will be allowed in view
    const [filterTypeList, setFilterTypeList] = React.useState<string[]>([]); // List that specifies whether "Event" or "Journal" entries should be displayed
    const [tagTitleList, setTagTitleList] = React.useState<number[]>([]); // List of Tags that will be allowed in view
    const [typeTitleList, setTypeTitleList] = React.useState<string[]>([]); // List that specifies whether "Event" or "Journal" entries should be displayed
    
    const popoverActions = React.useRef<any>(); // Gets popover to rerender whenever any of the icon buttons are clicked
    const userId = useAppSelector(store => store.user.user.id);
    const displaySpecificSwitches = false; //determines if switches are displayed for each type and tag or controlled all together in one
    const types = ['Events', 'Journal Entries'];

    React.useEffect(() => {
        (async ()=> {
            const toSwitchClick = [false, false];
            const toCheckClick = [true, true];
            const tempTypeFilterList = ['Event', 'Journal'];
            if (userId) {
                const tagResult = await getUserTags(userId);

                await Promise.all(tagResult.data.map(async (tag: Tag) => {
                    toSwitchClick.push(false);
                    toCheckClick.push(true); //set all displayed by default
                }))

                const tempTagFilterList: Tag [] = [];
                for (const tag of tagResult.data){
                    if (tag)  {
                        tempTagFilterList.push(tag)
                    }
                }
                setTags(tagResult.data);
                setFilterTagList(tempTagFilterList);
                setFilterTypeList(tempTypeFilterList);
                setSwitches(toSwitchClick);
                setCheckClicked(toCheckClick);
            }
        })()
    }, [userId])

    // Popover rerenders in the same position, reflecting state changes
    React.useEffect(() => {
        if (popoverActions.current) {
            popoverActions.current.updatePosition();
        }
        applyFilters(filterTypeList, filterTagList);
        applyTitleToggles(showAllTitles, typeTitleList, tagTitleList);

    }, [shouldUpdate, viewUpdated])

    /**
     * 
     * @param tagList the list of tags to be filtered
     * @returns returns tags that are not marked as archived 
     */
    const getActiveTags = (tagList: Tag[]) => {
        const activeTags: Tag[] = [];
        tagList.forEach((tag) => {
            if (tag.archived !== true)
                activeTags.push(tag);
        })
        return activeTags;
    }

    /**
     * Adds a tag to the user's taglist in the API
     * @param tagId the tag Id to be added to the current user in the API
     * @returns returns Promise
     */
    const addTagToUser = (tagId: number) => {
        return addUserTag(Number(userId), tagId).then(() => {
            getUserTags(Number(userId)).then(res => {
                setTags(getActiveTags(res.data))
            })
        });
    }

    /**
     * Tells the QuickCreateTag dialog to open
     */
    const handleDialogOpen = () => {
        setDialogOpen(true);
    }

    /**
     * Tells the QuickCreateTag dialog to close
     */
    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    /**
     * Handles changing the show titles switch to either enabled or disabled
     * 
     * @param event mouse event
     * @param idx index of the show array that should be changed
     */
    const handleSwitchClick = (event: React.MouseEvent<HTMLButtonElement>, idx:number, tagId?:number) => {
        const newArr = switchOn;
        if (newArr[idx] === false) { //if the icon is checked to display (previously false)
            newArr[idx] = true; //set to true
            // If this is to add Events
            if (idx === 0) {
                setTypeTitleList(typeTitleList.concat('Event'));
            } // If this is to add Journals
            else if (idx === 1) {
                setTypeTitleList(typeTitleList.concat('Journal'));
            } // This is to add  entries with a certain tag
            else {
                if (tagId)
                    setTagTitleList(tagTitleList.concat(tagId));
            }
        }
        else {
            newArr[idx] = false;
            // remove event from display
            if (idx === 0) {
                const copy = typeTitleList;
                const typeidx = copy.indexOf('Event');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setTypeTitleList(copy);
                }
            } // remove journal from display
            else if (idx === 1) {
                const copy = typeTitleList;
                const typeidx = copy.indexOf('Journal');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setTypeTitleList(copy);
                }
            }
            else { // remove tag from display
                if (tagId) {
                    const copy = tagTitleList;
                    const tagidx = copy.indexOf(tagId);
                    if(tagidx !== -1) {
                        copy.splice(tagidx, 1);
                        setTagTitleList(copy);
                    }
                }
            }
        }
        setSwitches(newArr);
        setShouldUpdate(!shouldUpdate);
    }

    /**
     * Handles changing the check icon to either be enabled or disabled, and properly
     * sets the FilterTypeList and/or the FilterTagList
     * 
     * @param event mouse event
     * @param idx index of the checkicon array to change
     * @param tag optional tag to be added to the list of tags that should be displayed
     */
    const handleCheckIconClick = (event: React.MouseEvent<HTMLButtonElement>, idx:number, tag?:Tag) => {
        const newArr = checkClicked;
        if (newArr[idx] === false) { //if the icon is checked to display (previously false)
            newArr[idx] = true; //set to true
            // If this is to add Events
            if (idx === 0) {
                setFilterTypeList(filterTypeList.concat('Event'));
            } // If this is to add Journals
            else if (idx === 1) {
                setFilterTypeList(filterTypeList.concat('Journal'));
            } // This is to add  entries with a certain tag
            else {
                if (tag)
                    setFilterTagList(filterTagList.concat(tag));
            }
        }
        else {
            newArr[idx] = false;
            // remove event from display
            if (idx === 0) {
                const copy = filterTypeList;
                const typeidx = copy.indexOf('Event');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setFilterTypeList(copy);
                }
            } // remove journal from display
            else if (idx === 1) {
                const copy = filterTypeList;
                const typeidx = copy.indexOf('Journal');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setFilterTypeList(copy);
                }
            }
            else { // remove tag from display
                if (tag) {
                    const copy = filterTagList;
                    const tagidx = copy.indexOf(tag);
                    if(tagidx !== -1) {
                        copy.splice(tagidx, 1);
                        setFilterTagList(copy);
                    }
                }
            }
        }
        setCheckClicked(newArr);
        setShouldUpdate(!shouldUpdate)
    }

    const handleToggleWeekends = () =>{
        toggleWeekendOnView(!showWeekend);
        toggleWeekend(!showWeekend);
    }

    const handleToggleAllTitles = () => {
        toggleShowAllTitles(!showAllTitles)
        setShouldUpdate(!shouldUpdate)
    }

    /**
     * If the masterSwitch is checking if active, it will only be shown if the specific switches are not displayed
     * If the subSwitches are checkign if active, they will only be displayed if displaySpecificSwitches is true
     * @param masterSwitch check if master switch is active
     * @returns class that will determine the display of a switch
     */
    function isActive(masterSwitch?: boolean){
        const isActiveSwitch = masterSwitch? !displaySpecificSwitches : displaySpecificSwitches
       
        return isActiveSwitch? '' : 'inactive';
    }

    const open = Boolean(anchorEl);

    return (
        <div>
            <Popover
                action={popoverActions}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    style: {
                        boxShadow: '2',
                        borderRadius:'7px',
                        minWidth: '170px',
                        maxWidth: '220px',
                        padding: '15px',
                    },
                }}
                classes={{
                    paper: 'year-filter-menu'
                }}
            >
                <div className='filter-menu-content'>
                    <div className='type-shownames-div'>
                        <Typography className='filter-headers'>Type</Typography>
                        <Typography className={'filter-show-names ' + isActive()}>Show Titles</Typography>
                    </div>
                    {
                        types.map((type,idx) => (
                            <div key={'type-' + type} className='filter-list-item' >
                                <Checkbox  checked={checkClicked[idx]} icon={<FilledCircleUnchecked color={'grey'}/>} checkedIcon={<CircleChecked className='checkbox'/>} name={'checked-' + type} onClick={(e) => handleCheckIconClick(e,idx)}/>
                                <Typography className='list-item-title'>{type}</Typography>
                                <div className={'switch-div ' + isActive()}>
                                    <Switch checked={switchOn[idx]} onClick={(e) => handleSwitchClick(e,idx)} className='switch' size='small' color='primary' />
                                </div>
                            </div>
                        ))
                    }
                    
                    <Typography className='filter-headers'>Tags</Typography>
                    {
                        tags.map((tag,idx) => (
                            <div key={'tag-' + tag.id} className='filter-list-item' >
                                <Checkbox checked={checkClicked[idx+2]} icon={<FilledCircleUnchecked color={tag.color} />} checkedIcon={<CircleChecked className='checkbox' style={{color: tag.color}}/>} name="checkedH" onClick={(e) => handleCheckIconClick(e,idx + 2, tag)} />
                                <Typography className='list-item-title'>{tag.name}</Typography>
                                <div className={'switch-div ' + isActive()}>
                                    <Switch checked={switchOn[idx+2]} onClick={(e) => handleSwitchClick(e,idx + 2, tag.id)} className='switch' size='small' color='primary' />
                                </div>
                            </div>
                        ))
                    }
                    <Button className='add-tag-btn' fullWidth variant='text' startIcon={<AddIcon className=''/>} onClick={handleDialogOpen}>Add Tag</Button>
                    <Typography className='filter-headers'>Settings</Typography>
                    <div key={'titles-toggle' } className={'setting-toggle-div ' + isActive(true)}>
                        <div className='switch-div setting-switch-div'>
                            <Switch checked={showAllTitles} onClick={handleToggleAllTitles} className='switch weekend-switch' size='small' color='primary' />
                        </div>
                        <Typography className='list-item-title'>Show Titles</Typography>
                    </div>
                    <div key={'weekend-toggle' } className='setting-toggle-div' >
                        <div className='switch-div setting-switch-div '>
                            <Switch checked={showWeekend} onClick={handleToggleWeekends} className='switch weekend-switch' size='small' color='primary' />
                        </div>
                        <Typography className='list-item-title'>Weekend View</Typography>
                        
                    </div>
                    
                    
                </div>
                <QuickCreateTag open={dialogOpen} handleClose={handleDialogClose} userId={userId!} addTag={addTagToUser}/>
            </Popover>
            
        </div>
    );
}

export default YearTagMenuFilter;

