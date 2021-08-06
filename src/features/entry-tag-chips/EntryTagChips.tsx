import * as React from 'react';
import { Tag } from '../../@types';
import { Chip, MenuItem, Menu, } from '@material-ui/core';
import QuickCreateTag from '../quick-create-tag/QuickCreateTag';
import { useAppSelector } from '../../store/hooks';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';


interface Props {
    userTags: Tag[],
    entryTags: Tag[],
    primaryTag?: number,
    addTag: (tagId: number | undefined) => void,
    addTagToUser: (tagId: number) => Promise<void>,
    deleteTag: (tagId: number | undefined) => void,
    size?: 'small' | 'medium' | undefined,
    clickedPrimary?: (tagId: number) => void,
}
/**
 * 
 * @param userTags A Tag[] of tags associated to the user
 * @param entryTags A Tag[] of tags associated to the entry
 * @param primaryTag Tag Id of the primary tag (if there is one)
 * @param addTag This function adds the tag from userTags to the entryTags
 * @param deleteTag This function removes the tag from the entryTags
 * @param addTagToUser Axios function call to create a tag and add it to the userTags
 * @param clickedPrimary Function that is called when a tag is clicked: sets the primary tag
 * @returns 
 */
const EntryTagChips: React.FC<Props> = ({ userTags, entryTags, addTag, addTagToUser, deleteTag, size, clickedPrimary, primaryTag }) => {
    const [createTagOpen, setCreateTagOpen] = React.useState<boolean>(false);
    const tokenId = useAppSelector(store => store.user.user.id);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [userId, setUserId] = React.useState<number>(0);
    const defaultTagColor = 'white';
    const [chipSize, setChipSize] = React.useState<'small' | 'medium' | undefined>('medium');
    const [selectedPrimaryTag, setSelectedPrimaryTag] = React.useState<number>(0)

    React.useEffect(() => {
        if (tokenId) {
            setUserId(tokenId)
        }
        setChipSize(getSize)


    }, [])
    // React.useEffect(()=>{
    //     if (primaryTag) {
    //         setSelectedPrimaryTag(primaryTag)
    //     }
    //     setDisplayedTags(entryTags)
    // },[primaryTag, entryTags])
    React.useEffect(() => {
        if (primaryTag) {
            setSelectedPrimaryTag(primaryTag)
        }
    }, [primaryTag])

    /**
    * helps add color to chosen tags in form
    * @param id id of tag to be retreived
    * @returns color of chip of chosen tag
    */
    const getTagColorById = (id: number | undefined) => {
        if (id) {
            const chosenTag = userTags.find(tag => tag.id === id);
            if (chosenTag) {
                return chosenTag.color;
            }
        }
        return defaultTagColor;
    }


    function getBackgroundColor(id: number | undefined): React.CSSProperties {
        if (id) {
            return {
                backgroundColor: getTagColorById(id)
            }
        }
        return {}
    }

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCreateTagOpen = () => {
        setCreateTagOpen(true)
    }
    const handleCreateTagClose = () => {
        setCreateTagOpen(false)
    }

    const addTagAndClose = (id: number | undefined) => {
        addTag(id);
        handleClose();
    }

    const getSize = (): 'small' | 'medium' | undefined => {
        if (size) {
            if (size === 'small')
                return 'small'
            else
                return 'medium'

        }
        return undefined
    }

    const handleTagClick = (tagId: number | undefined) => {
        if (tagId) {
            if (clickedPrimary)
                clickedPrimary(tagId)

            setSelectedPrimaryTag(tagId)
        }
    }
    const handleDeleteTag = (tagId: number | undefined) => {
        if (tagId) {
            if (tagId === selectedPrimaryTag) {
                setSelectedPrimaryTag(0)
            }
        }

        deleteTag(tagId)
    }
    const isPrimary = (tagId: number | undefined) => {
        if (tagId && selectedPrimaryTag) {
            if (tagId === selectedPrimaryTag) {
                return true
            }
        }
        return false
    }
    return (
        <>

            {entryTags.map(tag => {
                return (
                    <React.Fragment key={'entrytag-' + tag.id}>
                        {(isPrimary(tag.id)) ?
                            <Chip icon={<DoneIcon />} onClick={() => handleTagClick(tag.id)} style={getBackgroundColor(tag.id)} label={tag.name} onDelete={() => handleDeleteTag(tag.id)} size={chipSize} />
                            :
                            <Chip onClick={() => handleTagClick(tag.id)} style={getBackgroundColor(tag.id)} label={tag.name} onDelete={() => handleDeleteTag(tag.id)} size={chipSize} />

                        }

                    </React.Fragment>
                );
            })}
            <Chip icon={<AddIcon />} label='Tag' onClick={handleClick} size={chipSize} />
            <Menu
                id="tag-menu-list"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {userTags.map((tag) => {
                    if (tag.archived !== true)
                        return <MenuItem
                            onClick={() => { addTagAndClose(tag.id) }}
                            key={'userTag-' + tag.id + tag.name}
                            value={tag.name}
                        >{tag.name}
                        </MenuItem>
                })}
                <MenuItem onClick={handleCreateTagOpen}>+Create New Tag</MenuItem>
            </Menu>


            <QuickCreateTag userId={userId} open={createTagOpen} handleClose={handleCreateTagClose} addTag={addTagToUser} />

        </>)



}




export default EntryTagChips;