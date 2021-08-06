import * as React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import {
    TextField,
    Grid,
    Button,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core'
import { TagField } from '../../@types';

/**
 * Creates functionality to add, edit, delete fields from Tags
 * @param Props a fieldList in TagField[] format and a function that accepts fieldList in string format
 */

interface Props {
    fieldList: TagField[];
    setFieldString: (fieldList: string) => void;
}
const FieldList: React.FC<Props> = ({ fieldList, setFieldString: setFieldList }) => {
    
    const [fields, setFields] = React.useState<TagField[]>([]);
    const [open, setDialogOpen] = React.useState(false);
    const [fieldIndex, setFieldIndex] = React.useState(0);
    const [newField, setNewField] = React.useState<TagField>({
        body: '',
        type: ''
    })

    React.useEffect(() => {

        setFields(fieldList)

    }, [fieldList]);

    const handleFieldChange = (event: React.ChangeEvent<{ value: unknown }>, field: TagField, index: number, name: keyof TagField) => {
        const newFields = fields;
        newFields[index] = { ...field, [name]: event.target.value };
        setFieldList(JSON.stringify(newFields));
    }

    const deleteField = () => {
        const newFields = fields;
        newFields.splice(fieldIndex, 1);
        setFieldList(JSON.stringify(newFields));
        setDialogOpen(false)
        setFieldIndex(-1);
    }

    const addField = () => {
        const newFields = fields;
        newFields.push(newField);
        setFieldList(JSON.stringify(newFields));
        setNewField({
            body: '',
            type: ''
        })
    };
    const handleDeleteDialogOpen = (index: number) => {
        setFieldIndex(index);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
            {
                fields.map((field, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Grid item xs={6}>
                                <TextField multiline label="New Field" value={field.body} onChange={(e) => handleFieldChange(e, field, index, 'body')}></TextField>
                            </Grid>

                            <Grid item xs={2}>
                                <Select label={field.type} value={field.type} onChange={(e) => handleFieldChange(e, field, index, 'type')}>
                                    <MenuItem value=''><em>None</em></MenuItem>
                                    <MenuItem value={'Text'}>Text</MenuItem>
                                    <MenuItem value={'Email'}>Email</MenuItem>
                                    <MenuItem value={'Link'}>Link</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item  style={{paddingLeft: '25px'}}>
                                <Button onClick={()=>handleDeleteDialogOpen(index)}>   <DeleteIcon /> </Button>
                            </Grid>

                        </React.Fragment>
                    )
                }
                )
            }
            <Grid container direction='row'
                justify="space-evenly"
                alignItems="flex-end">
                <Grid item>
                    <Button onClick={() => addField()} endIcon={<AddIcon />}>Add New Field</Button>
                </Grid>
            </Grid>
            {/*  Delete dialog */ }
            <Dialog
                open={open}
                onClose={handleDialogClose}
            >
                <DialogTitle id='alert-dialog-title'>{'Delete field'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        Confirm delete field
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={() => deleteField()} color='primary' autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

}
export default FieldList;
