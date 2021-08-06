import * as React from 'react';
import { Tag, TagField } from '../../@types';
import FieldList from '../full-tag-list/FieldList';
import { deleteTag, updateTag } from '../../axios/tags';
import { CirclePicker } from 'react-color';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Box,
    Fab,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Container,
    Typography,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel
} from '@material-ui/core';

interface Props {
    parentTag: Tag; // Tag passed down from the FullTagList, will be synonymous with the state Tag
    tagChange: boolean // Specifies whether a Tag has been updated, triggering a re-render
    setTagChange: React.Dispatch<React.SetStateAction<boolean>> // Allows this component to set tagChange
}

/**
 * Complete component for each individual TagAccordion displayed on the FullTagList
 * 
 * @param props fields and functions passed from parent component
 * @returns 
 */
const TagAccordion: React.FC<Props> = ({ parentTag, tagChange, setTagChange }) => {
    const [tag, setTag] = React.useState<Tag>(parentTag); // Tag currently being displayed
    const [expanded, setExpanded] = React.useState<boolean>(false); // Tells accordion whether it should be open or not
    const [fields, setFields] = React.useState<TagField[]>([]); // Fields list of current Tag
    const [deleteDialog, setDeleteDialog] = React.useState(false); // Dictates whether delete dialog should be open or not
    const [archiveDialog, setArchiveDialog] = React.useState(false); // Dictates whether archive dialog should be open or not

    const defaultColors = ['#E88686', '#F8BD94', '#FDE79E', '#CEE59E', '#93BFA0', '#91f4c2', 
        '#A7D4E3', '#95B3E2', '#9292E7', '#AA9EE0', '#957DAD', '#EDB5E9', 
        '#f48bb1', '#BC8F8F', '#FFE4B5', '#D2B48C', '#DCDCDC', '#C0C0C0']

    // On render/refresh, sets current Tag correctly along with its fields
    React.useEffect(() => {
        setTag(parentTag);
        if (parentTag.fieldList) {
            setFields(JSON.parse(parentTag.fieldList));
        }
        else {
            setFields([]);
        } 
    }, []);

    /**
     * Changes the tagChange state, causing the FullTagList to re-render
     */
    const updateFullTagMenu = () =>{
        setTagChange(tagChange? false : true);
    }

    /**
     * Updates the current state Tag with the passed fieldList
     * 
     * @param fieldList new fields to update state Tag with
     */
    const setFieldList = (fieldList: string) => {
        const newTag = {
            id: tag.id,
            color: tag.color,
            name: tag.name,
            fieldList: fieldList,
            archived: tag.archived
        }
        setTag(newTag);
        updateFullTagMenu();
    }

    /**
     * When the save button is pressed, update the Tag in the database -> set state Tag
     * -> tell FullTagList to re-render
     */
    const handleSave = () => {
        setExpanded(false);
        updateTag(tag).then(res => {
            setTag(res.data);
            updateFullTagMenu();

        });
    }

    /**
     * Closes archive dialog -> archives current Tag -> updates Tag with Axios backend call
     * -> updates state Tag with Axios response -> re-renders FullTagList
     */
    const handleArchive = () => {
        setArchiveDialog(false);
        const newTag = {
            id: tag.id,
            color: tag.color,
            name: tag.name,
            fieldList: tag.fieldList,
            archived: true
        }
        updateTag(newTag).then(res => {
            setTag(res.data);
            updateFullTagMenu();
        });
    }
    
    /**
         * Closes archive dialog -> unarchives current Tag -> updates Tag with Axios backend call
         * -> updates state Tag with Axios response -> re-renders FullTagList
         */
    const handleUnarchive = () => {
        setArchiveDialog(false);
        const newTag = {
            id: tag.id,
            color: tag.color,
            name: tag.name,
            fieldList: tag.fieldList,
            archived: false
        }
            
        updateTag(newTag).then(res => {
            setTag(res.data);
            updateFullTagMenu();
        });
    }
    
    /**
         * Deletes the Tag from the backend, then waits for an OK response before telling
         * FullTagList to re-render. Also closes the delete dialog.
         */
    const handleDeleteTag = () => {
        if(tag.id)
            deleteTag(tag.id).then((res)=>{
                if(res.status === 200 ){
                    updateFullTagMenu();
                }
            });
        setDeleteDialog(false);
    }

    /**
     * Whenever any of the Tag properties are edited, the state Tag is updated accordingly
     * 
     * @param name property name of the Tag to change
     * @returns 
     */
    const handleTagChange = (name: keyof Tag) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setTag({ ...tag, [name]: event.target.value });
    }

    /**
     * Tells the accordion to change from open to close (or vice versa)
     */
    const handleAccordionChange = () => {
        setExpanded(expanded ? false : true);
    };

    /**
         * If cancel button is pressed, the accordion is collapsed
         */
    const handleCancel = () => {
        setExpanded(false);
        setTag(parentTag);
        if (parentTag.fieldList) {
            setFields(JSON.parse(parentTag.fieldList));
        }
        else {
            setFields([]);
        } 
    }

    /**
     * Opens the delete dialog
     */
    const handleDeleteDialogOpen = () => {
        setDeleteDialog(true);
    };

    /**
     * Closes the delete dialog
     */
    const handleDeleteDialogClose = () => {
        setDeleteDialog(false);
    };

    /**
     * Opens the archive dialog
     */
    const handleArchiveDialogOpen = () => {
        setArchiveDialog(true);
    };

    /**
     * Closes the archive dialog
     */
    const handleArchiveDialogClose = () => {
        setArchiveDialog(false);
    };
    
    return (
        <Box key={tag.id} className='TagAccordionContainer' >
            <Accordion style={{borderRadius: '10px'}} expanded={expanded} onChange={handleAccordionChange}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >  
                    <Grid container justify="flex-start" alignItems="center" spacing={3} >
                        <Grid item>
                            <Fab
                                style={{ 
                                    backgroundColor: tag.color,
                                }}
                                disabled={true}
                                disableFocusRipple={true}
                                disableRipple={true}
                                size='small'
                                className='colorFab'
                            >
                            </Fab>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5" >{tag.name}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container
                        justify="flex-end">
                        <FormControlLabel
                            aria-label="delete"
                            onClick={(event) => event.stopPropagation()}
                            onFocus={(event) => event.stopPropagation()}
                            control={<Button onClick={() => handleDeleteDialogOpen()}> <DeleteIcon /></Button>}
                            label=""
                        />  
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Grid className='expandedGrid' container spacing={5} justify="flex-start" alignItems="flex-start">
                            <Grid item xs={4}>
                                <Grid container spacing={1}
                                    justify="flex-end"
                                    alignItems="flex-end" >

                                    <Grid item xs={4}>
                                        <Typography variant="h6" align="center"> Name </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <TextField multiline label="" value={tag.name} onChange={handleTagChange(('name'))}></TextField>
                                    </Grid>
                                    <Grid item xs={4} style={{paddingBottom: '30px'}}>
                                        <Typography variant="h6" align='center'> Color </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <CirclePicker 
                                            className='accordionPicker'
                                            onChange={(color) => setTag({ ...tag, ['color']: color.hex })}
                                            circleSize={20}
                                            circleSpacing={7}
                                            width='170px'
                                            colors={defaultColors}
                                        />    
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={8}>
                                <Grid container spacing={1}
                                    justify="center"
                                    alignItems="flex-start">
                                    <Grid item xs={3} style={{paddingTop: '15px'}}>
                                        <Typography variant="h6" align="center" > Fields </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Grid container spacing={0}
                                            justify="flex-start"
                                            alignItems="flex-end"
                                        >
                                            {/* start field list */}
                                            <FieldList fieldList={fields} setFieldString={setFieldList} />
                                            {/* end field list */}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Container>
                            <Grid
                                container
                                direction="row"
                                justify="flex-end"
                                alignItems="flex-end"
                                spacing={1}
                            >
                                <Grid item>
                                    {   // If the Tag has been archived, show the unarchive button (and vice versa)
                                        tag.archived ? <Button id = {tag.name+'unarchive'} className='accordionButtons' onClick={handleArchiveDialogOpen} color='primary'>Unarchive</Button>
                                            : <Button id={tag.name+'archive'} className='accordionButtons' onClick={handleArchiveDialogOpen}>Archive</Button>
                                    }
                                </Grid>
                                <Grid item>
                                    <Button id={tag.name+'cancel'}className='accordionButtons secondaryColor' variant="contained" onClick={ handleCancel} > <Box component="span"  className='ButtonTextWhite'> Cancel </Box></Button>
                                </Grid>
                                <Grid item>
                                    <Button id={tag.name+'save'}className='accordionButtons saveButton' variant="contained" color='primary' onClick={handleSave}>
                                        <Box component="span" className='ButtonTextWhite'> Save</Box>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Container>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            {/** Dialog opened when the User presses the delete button */}
            <Dialog
                open={deleteDialog}
                onClose={handleDeleteDialogClose}
            >
                <DialogTitle id='alert-dialog-title'>{'Delete Tag?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        Confirm delete {tag.name}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteTag} color='primary' autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {   // If the tag is archived, display dialog for unarchiving and vice versa
                tag.archived ? <Dialog
                    // Opened when the User pressed the unarchive button
                    open={archiveDialog}
                    onClose={handleArchiveDialogClose}
                >
                    <DialogTitle id='alert-dialog-title'>{'Unarchive Tag?'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                        Confirm unarchive {tag.name}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button id={tag.name+'cancelUnarchive'} onClick={handleArchiveDialogClose} color='primary'>
                        Cancel
                        </Button>
                        <Button id={tag.name+'confirmUnarchive'} onClick={handleUnarchive} color='primary' autoFocus>
                        Unarchive
                        </Button>
                    </DialogActions>
                </Dialog> :            <Dialog
                    // Opened when the User presses the archive button
                    open={archiveDialog}
                    onClose={handleArchiveDialogClose}
                >
                    <DialogTitle id='alert-dialog-title'>{'Archive Tag?'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                        Confirm archive {tag.name}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button  id={tag.name+'cancelArchive'} onClick={handleArchiveDialogClose} color='primary'>
                        Cancel
                        </Button>
                        <Button id={tag.name+'confirmArchive'}onClick={handleArchive} color='primary' autoFocus>
                        Archive
                        </Button>
                    </DialogActions>
                </Dialog>
            }
        </Box>
    )
}

export default TagAccordion;
