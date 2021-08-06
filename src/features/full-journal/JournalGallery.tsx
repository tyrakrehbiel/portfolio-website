import {
    Button,
    Fab,
    Typography,
    Box,
    TextField,
    Divider,
    Checkbox,
    FormControlLabel,
    List,
    Grid,
    ListItem
} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';

import {
    BT,
    BGrid
} from 'mui-bueno';

import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Entry, DecodedToken, Tag } from '../../@types';
import { getUserEntries } from '../../axios/entries';
import { getUserTags } from '../../axios/tags';

import jwt_decode from 'jwt-decode';
import { useAppSelector } from '../../store/hooks';

import './_FullJournal.scss';
import JournalCard from './JournalCard';

const JournalGallery: React.FC = () => {
    const history = useHistory();

    const token = useAppSelector(store => store.login.token);
    const decodedToken: DecodedToken = jwt_decode(token);
    const userId = decodedToken.id;

    const [journals, setJournals] = React.useState<Entry[]>([]);
    React.useEffect(() => {
        if (userId) {
            getUserEntries(userId).then(res => {
                const journalList: Entry[] = []
                res.data.forEach((entry) => {
                    if (entry.entryType == 'Journal')
                        journalList.push(entry)

                })
                return journalList
            }).then(journalList => {
                setJournals(journalList);
            });
        }
    }, []);

    const [tags, setTags] = React.useState<Tag[]>([]);

    React.useEffect(() => {
        getUserTags(Number(userId)).then(res => {
            setTags(res.data)
        })
    }, [userId]);

    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            setSearchTerm(event.target.value);
            setSort('Search');
        }
        else {
            setSearchTerm(event.target.value);
            setSort('');
        }
    }

    const [sort, setSort] = React.useState<string>('');
    const sortOptions = ['Title: Ascending', 'Title: Descending', 'Date: Most Recent', 'Date: Earliest']
    const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSort(event.target.value as string);
    }

    //adapted from full tag list, modified for filter functionality
    const compareJournalId = (a: Entry, b: Entry) => {
        if (a.id && b.id) {
            return a.id > b.id;
        }
        else {
            return 1;
        }
    }

    const sortJournals = () => {
        const sortedJournals = journals;

        switch (sort) {
        case 'Title: Ascending':
            return sortedJournals.sort((a, b) => 
                (a.title.toLowerCase() > b.title.toLowerCase()) 
                    ? 1 : (a.title.toLowerCase() === b.title.toLowerCase()) 
                        ? (compareJournalId(a, b) ? 1 : -1) : -1);

        case 'Title: Descending':
            return sortedJournals.sort((a, b) => 
                (a.title.toLowerCase() < b.title.toLowerCase()) 
                    ? 1 : (a.title.toLowerCase() === b.title.toLowerCase()) 
                        ? (compareJournalId(a, b) ? 1 : -1) : -1);

        case 'Date: Earliest':
            return sortedJournals.sort((a, b) => 
                (compareJournalId(a, b)) ? 1 : -1);

        case 'Date: Most Recent':
            return sortedJournals.sort((a, b) => 
                (compareJournalId(b, a)) ? 1 : -1);

        case '':
            return sortedJournals.sort((a, b) => 
                (compareJournalId(a, b)) ? 1 : -1);
        
        case 'Filter':
            return sortedJournals.filter(entry => 
                filters.every(tag => (tag.id != undefined) && entry.tagIds.includes(tag.id)));

        case 'Search':
            return sortedJournals.filter(a => a.title.toLowerCase()
                .includes(searchTerm.toLowerCase()));

        default:
            return journals;
        }
    }

    const [checked, setChecked] = React.useState(true);
    const [filters, setFilters] = React.useState<Tag[]>(tags);

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, tag:Tag)=> {
        setChecked(event.target.checked);
        const filterList = filters;
        if(!filterList.includes(tag)) {
            filterList.push(tag);
        }

        else {
            const index = filterList.indexOf(tag);
            filterList.splice(index, 1);
        }
        
        setFilters(filterList);
        setSort('Filter');
    };

    return (
        <div>
            <BGrid container xs={12} >
                <BGrid xs={9}>
                    <BT color='secondary' variant='h6'>
                        Journal Gallery
                    </BT>
                </BGrid>
                <BGrid xs={3}>
                    <Button className='backButton' onClick={() => history.push('/year')}>
                        <Typography>&#60; Go Back to Calendar </Typography>
                    </Button>
                </BGrid>
            </BGrid>
            <Grid container xs={12}>
                <Grid container xs={8} wrap='wrap'>
                    {sortJournals().map((journal: Entry) => {
                        return <BGrid
                            key={'journal-' + journal.id}
                            xs={4}
                        >
                            <JournalCard
                                journal={journal}
                                userId={userId}
                            >
                            </JournalCard>
                        </BGrid>
                    })}
                </Grid>
                <BGrid container xs={4}>
                    <Box
                        borderLeft={1}
                        maxHeight
                        borderColor='grey.500'
                        display='block'
                    >
                        <BGrid container>
                            <BGrid >
                                <TextField
                                    label='Search for a Journal'
                                    type='search'
                                    value={searchTerm}
                                    placeholder='Enter search term'
                                    onChange={handleSearch}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <SearchIcon />
                                        ),
                                    }}
                                />
                            </BGrid>
                            <Divider />
                            <BGrid>
                                <Autocomplete
                                    value={sort}
                                    onChange={() => handleSortChange}
                                    inputValue={sort}
                                    fullWidth
                                    onInputChange={(event, newInputValue) => {
                                        setSort(newInputValue);
                                    }}
                                    options={sortOptions}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            label="Sort By"
                                            variant="outlined"
                                        />
                                    }
                                />
                            </BGrid>
                            <BGrid container>
                                <BGrid xs={1}>
                                    <FilterListIcon />
                                </BGrid>
                                <BGrid xs={11}>
                                    <Typography>Filter By Tags</Typography>
                                    {tags.map(tag => {
                                        return <List
                                            key={'tag-' + tag.id}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        value={checked}
                                                        onChange={(e) => handleCheck(e,tag)}
                                                        color="primary"
                                                    />
                                                }
                                                label={tag.name}
                                            />
                                        </List>

                                    })}
                                </BGrid>
                            </BGrid>

                            <BGrid
                                justify='right'
                                alignment='bottom'
                            >
                                <Fab
                                    color='primary'
                                    onClick={() => history.push('/journal/new')}
                                    aria-label='Add New Journal'
                                >
                                    <AddIcon />
                                </Fab>
                            </BGrid>
                        </BGrid>
                    </Box>
                </BGrid>
            </Grid>
        </div>
    );
};

export default JournalGallery;
