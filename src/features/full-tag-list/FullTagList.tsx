import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import SortIcon from '@material-ui/icons/Sort';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import AddIcon from '@material-ui/icons/Add';
import {
    Typography,
    TextField,
    Grid,
    Button,
    Box,
    Fab,
    Select,
    MenuItem,
    FormControl,
    FormLabel,
    FormControlLabel,
    RadioGroup,
    Radio,
    Tooltip
} from '@material-ui/core'
import { Tag } from '../../../src/@types';
import QuickCreateTag from '../quick-create-tag/QuickCreateTag';
import TagAccordion from '../full-tag-list/TagAccordion';
import { addUserTag } from '../../axios/user';
import { getUserTags } from '../../axios/tags';



const FullTagList: React.FC = () => {
    const userId = useAppSelector(store => store.user.user.id);

    const [tags, setTags] = React.useState<Tag[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = React.useState<boolean>(false);
    const [sort, setSort] = React.useState<string>('default');
    const [filter, setFilter] = React.useState('Active');
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    /** State hook for allowing TagAccordions to tell FullTagMenu to rerender */
    const [tagChange, setTagChange] = React.useState<boolean>(false);

    const history = useHistory();

    React.useEffect(() => {
        getUserTags(Number(userId)).then(res => {
            setTags(getActiveTags(res.data))
        })
    }, [userId]);

    React.useEffect(() => {
        filterTagList(filter);
    }, [filter, tagChange]);



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


    const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSort(event.target.value as string);
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            setSearchTerm(event.target.value);
            setSort('tagsearch');
        }
        else {
            setSearchTerm(event.target.value);
            setSort('default');
        }
    }
    /**
     * Takes the tags state and sorts it by value specified in JSX select
     * @returns returns a sorted tag list
     */
    const getSortedTags = () => {
        const sortedTags = tags;
        switch (sort) {
        case 'a-z':
            return sortedTags.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : (a.name.toLowerCase() === b.name.toLowerCase()) ? (compareTagId(a, b) ? 1 : -1) : -1);

        case 'z-a':
            return sortedTags.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? 1 : (a.name.toLowerCase() === b.name.toLowerCase()) ? (compareTagId(a, b) ? 1 : -1) : -1)

        case 'default':
            return sortedTags.sort((a, b) => (compareTagId(a, b)) ? 1 : -1);

        case 'tagsearch':
            return sortedTags.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.fieldList.toLowerCase().includes(searchTerm.toLowerCase()));

        default:
            return tags;
        }
    }
    /**
     *  Function is necessary to prevent null comparisons in Id field
     * @param a Tag A whose Id is to be compared
     * @param b Tag b whose Id isto be compared
     * @returns true if A.id > b.id or 1 if either of them are missing the id
     */
    const compareTagId = (a: Tag, b: Tag) => {
        if (a.id && b.id) {
            return a.id > b.id;
        }
        else {
            return 1; // if both tags don't have an ID return 1
        }
    }

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((event.target as HTMLInputElement).value);
    };

    /**
     * Takes a value from the radio buttons in the JSX and sets the Tags to the specified filter
     * @param filter value from radio buttons in JSX
     */
    const filterTagList = (filter: string) => {
        switch (filter) {
        case 'Full':
            getUserTags(Number(userId)).then(res => {
                return setTags(res.data)
            });
            break;
        case 'Active':
            getUserTags(Number(userId)).then(res => {
                return getActiveTags(res.data)
            }).then(tags => {
                return setTags(tags)
            })
            break;
        case 'Archived':
            getUserTags(Number(userId)).then(res => {
                return getArchivedTags(res.data)
            }).then(tags => {
                return setTags(tags)
            })
            break;
        default:
            break;

        }
    }
    /**
     * 
     * @param tagList the list of tags to be filtered
     * @returns returns tags that are marked as archived 
     */

    const getArchivedTags = (tagList: Tag[]) => {
        const archTags: Tag[] = [];
        tagList.forEach((tag) => {
            if (tag.archived == true)
                archTags.push(tag);
        })

        return archTags;
    }
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
     * Open the add new tag dialog box
     */
    const handleCreateDialogOpen = () => {
        setCreateDialogOpen(true);
    };
    /**
     * Close the add new tag dialog box
     */

    const handleCreateDialogClose = () => {
        setCreateDialogOpen(false);
    };

    /**
     * This CSS property controls how low on the page the Add tag button sits
     */
    const addButtonHeight: React.CSSProperties = {
        height: '60vh'
    };

    /**
     * This CSS property controls the tag accordion height and width
     */
    const limitHeight: React.CSSProperties = {
        maxHeight: '90vh',
        minHeight: '90vh',
        height: '90vh',
        overflowX: 'hidden',
    };

    return (
        <Box className='FullTagListContainer'>
            <Grid container spacing={1} className='titleGrid' >
                <Grid item xs={6}>
                    <Typography className='tagsTitle' variant="h3">My {filter} Tag List</Typography>
                </Grid>
                <Grid item xs={6} className='backButtonGridItem'>
                    <Grid container className='backButtonContainer'>
                        <Button className='backButton' onClick={() => history.push('/year')}>
                            <Typography>&#60; Go Back to Calendar </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={3} className='bodyGrid'>
                <Grid item xs={8} >
                    <Box component='div' style={limitHeight} overflow='overlay'>
                        {getSortedTags().map((tag) => {
                            return (
                                <TagAccordion key={tag.id} parentTag={tag} tagChange={tagChange} setTagChange={setTagChange} />
                            )
                        })}
                    </Box>
                </Grid>

                <Grid item xs={4}>
                    <Box>
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            alignItems="stretch"
                            spacing={3}
                            style={addButtonHeight}
                        >
                            <Grid item className='searchContainer'>
                                <TextField
                                    label='Search Tags...'
                                    type='search'
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className='searchBar'
                                    InputProps={{
                                        startAdornment: (
                                            <Tooltip title='Search by Tag Name or Field' arrow>
                                                <SearchIcon />
                                            </Tooltip>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item className='sortContainer' >
                                <Grid container
                                    justify="flex-start"
                                    alignItems="baseline">
                                    <Grid item xs={1}>
                                        <SortIcon />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography>Sort by</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Select disableUnderline label="Sort" id="sortselect" value={sort} onChange={handleSortChange}>
                                            <MenuItem id="defaultsort" value={'default'}>Default</MenuItem>
                                            <MenuItem id="azsort" value={'a-z'}>A-Z</MenuItem>
                                            <MenuItem id="zasort" value={'z-a'}>Z-A</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item className='filterContainer'>
                                <Grid container alignItems="flex-start">
                                    <Grid item>
                                        <FilterListIcon />
                                    </Grid>
                                    <Grid item style={{ marginLeft: '2px', marginTop: '0.25rem' }}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Filter Tags</FormLabel>
                                            <RadioGroup aria-label="filter" name="filter" value={filter} onChange={handleFilterChange}>
                                                <FormControlLabel id="activeradio" value="Active" control={<Radio />} label="Active" />
                                                <FormControlLabel id="archivedradio" value="Archived" control={<Radio />} label="Archived" />
                                                <FormControlLabel id="allradio" value="Full" control={<Radio />} label="All" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Grid>
                        <Grid className='addButtonContainer' container direction='column' alignItems='flex-end'>
                            <Grid item xs={12} style={{ paddingRight: '3vw' }}>
                                <Tooltip title={<Typography>{'Create Tag'}</Typography>} arrow>
                                    <Fab color='primary' onClick={handleCreateDialogOpen} className='addButtonSizing'>
                                        <AddIcon className='addButtonSizing' />
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid >
            <QuickCreateTag open={createDialogOpen} handleClose={handleCreateDialogClose} userId={Number(userId)} addTag={addTagToUser} />
        </Box >
    );
}

export default FullTagList;