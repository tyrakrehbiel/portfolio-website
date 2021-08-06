import * as React from 'react';
import { Tag, TagField } from '../../@types';
import * as yup from 'yup';
import { createTag } from '../../axios/tags';
import FieldList from '../full-tag-list/FieldList';
import './_QuickCreateTag.scss';

import { TransitionProps } from '@material-ui/core/transitions';
import { CirclePicker } from 'react-color';
import { 
    TextField,
    Fab, 
    Popover, 
    Grid, 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle,
    Slide,
    FormHelperText
} from '@material-ui/core';

/**
 * Specifies which fields are needed when creating a Tag
 */
const schema = yup.object<Tag>().shape({
    name: yup.string().required('Name is required'),
    color: yup.string().required('Color is required'),
});

/**
 * Slide-in transition that is used by the component
 */
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

interface Props {
    open: boolean; // Should the dialog be open or not
    handleClose: () => void; // Close the dialog on exit
    userId: number; // Id of the current user, used on Tag creation
    addTag?: (tagId: number) => Promise<void>; // Axios call to add the tag to a specific user
}

/**
 * Complete component for a dialog box that allows user to quickly create a Tag
 * 
 * @param props fields and functions passed from parent component
 */
const QuickCreateTag: React.FC<Props> = (props: Props) => {
    const open = props.open;
    const addTag = props.addTag;
    const [tag, setTag] = React.useState<Tag>({
        id: undefined,
        name: '',
        color: '',
        fieldList: '',
        archived: false
    }) // Tag that will eventually be created
    const [errors, setErrors] = React.useState<any>({}); // Error state to be set during validation
    const [displayColorPicker, setDisplayColorPicker] = React.useState<boolean>(false); // Tells the colorPicker whether to display or not
    const [fields, setFields] = React.useState<TagField[]>([]); // List of fields that are changed to readible JSON for database
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null); // Used by ColorPicker popover as reference for what object to open from

    const defaultColors = ['#E88686', '#F8BD94', '#FDE79E', '#CEE59E', '#93BFA0', '#91f4c2', 
        '#A7D4E3', '#95B3E2', '#9292E7', '#AA9EE0', '#957DAD', '#EDB5E9', 
        '#f48bb1', '#BC8F8F', '#FFE4B5', '#D2B48C', '#DCDCDC', '#C0C0C0']

    // Runs on refresh/render to check if the Tag has fields that the state needs to mirror
    React.useEffect(() => {
        if (tag.fieldList) {
            setFields(JSON.parse(tag.fieldList));
        }
        else {
            setFields([]);
        }
    }, []);

    /**
     * Called after User clicks create, creates the Tag and adds it to the User
     * 
     * @param event 
     */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        schema.validate(tag, { abortEarly: false })
            .then(() => {
                setErrors({});
                // Axios call -> creates Tag in database
                createTag(tag).then(res => {
                    setTag(res.data);
                    // If Tag id exists, add the newly created Tag to the User
                    if (addTag && res.data.id)
                        addTag(res.data.id).then(() => {
                            setTag({
                                id: undefined,
                                name: '',
                                color: '',
                                fieldList: '',
                                archived: false
                            });
                            setFields([]);
                        });
                    // Close the dialog window (return to FullTagList)
                    props.handleClose();
                });
            }).catch((err: yup.ValidationError) => {
                const list: any = {};
                for (const e of err.inner) {
                    if (e.path) {
                        list[e.path] = e.message;
                    }
                }
                // Show accumulated errors
                setErrors(list);
            })
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
            archived: false
        }
        setTag(newTag);
    }

    /**
     * Resets the state Tag's properties and errors so they do not persist after canceling create or
     * clicking off of the dialog.
     */
    const handleResetTag = () => {
        setFields([]);
        setTag({
            id: undefined,
            color: '',
            name: '',
            fieldList: '',
            archived: false
        })
        setErrors('');
        props.handleClose();
    }
    
    /**
     * Whenever the Tag title is changed, the current Tag state is updated accordingly
     * 
     * @param name the property of Tag that needs to be changed
     * @returns 
     */
    const handleChange = (name: keyof Tag) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setTag({ ...tag, [name]: event.target.value });
    }

    /**
     * Called after the color fab is pressed, tells the ColorPicker to open, sets the anchor to the fab
     * 
     * @param event 
     */
    const handleColorOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setDisplayColorPicker(true);
    };

    /**
     * Called after a color is picked, the fab is repressed, or there is a click outside of the popover.
     * Closes the ColorPicker popover
     */
    const handleColorClose = () => {
        setDisplayColorPicker(false);
        setAnchorEl(null);
    };
    
    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleResetTag}
                PaperProps={{
                    style: { border: `3px solid ${tag.color}`, borderRadius: '7px'}
                }}
            >
                <DialogTitle id='form-dialog-title'>
                    Create a New Tag
                </DialogTitle>
                <DialogContent>
                    <Grid container
                        alignItems='center'
                        direction='row'
                        spacing={0}>
                        <Grid item xs={2}>
                            <Grid container
                                alignItems='flex-start'>
                                <Fab
                                    className='color-fab'
                                    style={{ backgroundColor: tag.color }}
                                    size='small'
                                    onClick={(e) => handleColorOpen(e)}
                                >
                                </Fab>
                                {
                                    displayColorPicker ? <div>
                                        <Popover
                                            open={displayColorPicker}
                                            onClose={handleColorClose}
                                            anchorEl={anchorEl}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                            PaperProps={{
                                                style: { border: `3px solid ${tag.color}` }
                                            }}
                                            classes={{
                                                paper: 'color-picker-popover'
                                            }}
                                        >
                                            {/** Once a color is picked, set the Tag's color property to its hex value */}
                                            <CirclePicker onChange={(color) => setTag({ ...tag, ['color']: color.hex })}
                                                onChangeComplete={handleColorClose}
                                                colors={defaultColors}
                                            />
                                        </Popover>
                                    </div> : null
                                }

                                <FormHelperText error>{errors['color']} </FormHelperText>
                            </Grid>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                className='tag-title-textfield'
                                label='Add Tag Title'
                                margin='dense'
                                variant='outlined'
                                value={tag.name}
                                onChange={handleChange('name')}
                                error={!!errors['name']}
                                helperText={errors['name']}
                            />
                        </Grid>
                    </Grid>
                    <div className='field-list-container'>
                        <Grid container spacing={0}
                            justify='center'
                            alignItems='flex-end'>
                            <FieldList fieldList={fields} setFieldString={setFieldList} />
                        </Grid>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button className='roundedButtons' onClick={handleResetTag} variant='contained' color='default'>
                        Cancel
                    </Button>
                    <Button className='roundedButtons' onClick={handleSubmit} variant='contained' color='primary'>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuickCreateTag;