import React from 'react';
import { Button, Typography, Popover, Checkbox} from '@material-ui/core';
import './_TagMenuFilter.scss';
import { useAppSelector } from '../../store/hooks';
import AddIcon from '@material-ui/icons/Add';
import { Tag, CalendarEntry } from '../../@types';
import { getUserTags } from '../../axios/tags';
import { addUserTag } from '../../axios/user';
import QuickCreateTag from '../quick-create-tag/QuickCreateTag';
import CircleChecked from '@material-ui/icons/CheckCircle';
import FilledCircleUnchecked from './FilledCircleUnchecked';
import './_TagMenuFilter.scss';

interface Props {
    anchorEl: HTMLButtonElement | null,
    handleClose: () => void,
    applyFilters: (types:string[], tagList:Tag[]) => void,
    entries?: CalendarEntry[],
    viewUpdated: boolean
}

/**
 * @param anchorEl the html element for the menu to open under (opens on center bottom)
 * @param handleClose passed in function that closes the popover completely (this should just be setting anchorEl to null)
 * @param applyFilters the function that is called whenever one of the filters is chosen. Can be handled however the parent wants.
 * @param entries (OPTIONAL) the list of entries that the parent is currently using, added only for flexibility
 * @param viewUpdated a boolean that, when changed, calls the applyFilters in the parent
 */
const TagMenuFilter:React.FC<Props> = ({anchorEl, handleClose, applyFilters, entries, viewUpdated}: Props) => {

    const [tags, setTags] = React.useState<Tag[]>([]);
    const [typeList, setTypeList] = React.useState<string[]>(['Event', 'Journal']);
    const [checkClicked, setCheckClicked] = React.useState<boolean[]>([]);
    const [shouldUpdate, setShouldUpdate] = React.useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [filterTagList, setFilterTagList] = React.useState<Tag[]>([]); // List of Tags that should be filtered out of view
    const [filterTypeList, setFilterTypeList] = React.useState<string[]>([]); // List that specifies whether "Event" or "Journal" entries should be filtered out
    const popoverActions = React.useRef<any>(); // Gets popover to rerender whenever any of the icon buttons are clicked
    const userId = useAppSelector(store => store.user.user.id);

    React.useEffect(() => {
        (async ()=> {
            const toCheckClick = [false, false];
            if (userId) {
                const tagResult = await getUserTags(userId);

                await Promise.all(tagResult.data.map(async (tag: Tag) => {
                    toCheckClick.push(false);
                }))
                setTags(tagResult.data);
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
        const result = addUserTag(Number(userId), tagId).then(() => {
            getUserTags(Number(userId)).then(res => {
                setTags(getActiveTags(res.data))
            })
        });
        return result;
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
     * Handles changing the check icon to either be enabled or disabled, and properly
     * sets the FilterTypeList and/or the FilterTagList
     * 
     * @param event mouse event
     * @param idx index of the checkicon array to change
     * @param tag optional tag to be added to the list of tags that should be filtered out
     */
    const handleCheckIconClick = (event: React.MouseEvent<HTMLButtonElement>, idx:number, tag:Tag|undefined) => {
        const newArr = checkClicked;
        if (newArr[idx] === false) {
            newArr[idx] = true;
            // If this is to filter out Events
            if (idx === 0) {
                setFilterTypeList(filterTypeList.concat('Event'));
            } // Else if this is to filter out Journals
            else if (idx === 1) {
                setFilterTypeList(filterTypeList.concat('Journal'));
            } // This is to filter out entries with a certain tag
            else {
                if (tag)
                    setFilterTagList(filterTagList.concat(tag));
            }
        }
        else {
            newArr[idx] = false;
            // If this is turning off Event filter
            if (idx === 0) {
                const copy = filterTypeList;
                const typeidx = copy.indexOf('Event');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setFilterTypeList(copy);
                }
            } // Else if this is turning off Journal filter
            else if (idx === 1) {
                const copy = filterTypeList;
                const typeidx = copy.indexOf('Journal');
                if(typeidx !== -1) {
                    copy.splice(typeidx, 1);
                    setFilterTypeList(copy);
                }
            }
            else { // Turning off a tag filter
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
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    style: {
                        boxShadow: '2',
                        borderRadius:'7px',
                        minWidth: '140px',
                        maxWidth: '200px',
                        padding: '15px',
                    },
                }}
                classes={{
                    paper: 'tag-filter-menu'
                }}
            >
                <div className='filter-menu-content'>
                    <div className='type-shownames-div'>
                        <Typography className='filter-headers'>Type</Typography>
                    </div>
                    {
                        typeList.map((type,idx) => (
                            <div key={'type-' + type} className='filter-list-item' >
                                <Checkbox  checked={checkClicked[idx]} icon={<CircleChecked className='checkbox'/>} checkedIcon={<FilledCircleUnchecked color={'grey'}/>} name={'checked-' + type} onClick={(e) => handleCheckIconClick(e,idx, undefined)}/>
                                <Typography className='list-item-title'>{type}</Typography>
                            </div>
                        ))
                    }
                    <Typography className='filter-headers'>Tags</Typography>
                    {
                        tags.map((tag,idx) => (
                            <div key={'tag-' + tag.id} className='filter-list-item' >
                                <Checkbox checked={checkClicked[idx+2]} icon={<CircleChecked className='checkbox' style={{color: tag.color}}/>} checkedIcon={<FilledCircleUnchecked color={tag.color} />} name="checkedH" onClick={(e) => handleCheckIconClick(e,idx + 2, tag)} />
                                <Typography className='list-item-title'>{tag.name}</Typography>
                            </div>
                        ))
                    }
                    <Button className='add-tag-btn' fullWidth variant='text' startIcon={<AddIcon className=''/>} onClick={handleDialogOpen}>Add Tag</Button>
                </div>
                <QuickCreateTag open={dialogOpen} handleClose={handleDialogClose} userId={userId!} addTag={addTagToUser}/>
            </Popover>
            
        </div>
    );
}

export default TagMenuFilter;