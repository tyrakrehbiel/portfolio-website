import React, { FunctionComponent } from 'react';
import { Button, CardHeader, Card, CardContent, CardActions } from '@material-ui/core';
import { createImageStore } from '../../axios/imageStores';
import { BForm, BFileUpload, BT } from 'mui-bueno';
import { Formik, FormikHelpers } from 'formik';

/*
This guy is not being used atm. However in case future people want to use this, here is what you would need to
make this guy work:
//Part 1 Uploads
const [open, setOpen] = React.useState<boolean>(false);

// Part 2 uploads (or whatever action you want carried out on upload)
const handleUpload = (uploadedImageStoreIds: number[]) => {
    const oldImageStoreIds = event.imageStoreIds;
    const newImageStoreIds = oldImageStoreIds.concat(uploadedImageStoreIds);
}

// Part 3 uploads
function clicked(){
    setOpen(true);
}

// Part 4 uploads
const handleModalClose = () => {
    setOpen(false);
}

And then in the return
//Part 5 Uploads
<BButton id='create-btn' onClick={() => clicked()}>Upload Attachments</BButton>

//Part 6 Uploads
{open &&
    <Modal
        open={open}
        onClose={handleModalClose}
        className="modal-form"
        disableScrollLock
    >
        <div className="event-modal-form">
            <FileUploadModal
                entryId={Number(eventId)}
                modalOpen={open}
                handleModalClose={handleModalClose}
                handleUpload={handleUpload}
            />
        </div>
    </Modal>
}

Beware that this modal goes ahead and creates image stores - if you do not want this behavior see how 
attachment-card works for example of passing image but not storing till later confirmation
*/

interface FileUploadModalProps {

  entryId: number;
  handleUpload: (uploadedImageStoreIds :  number[]) => void;
  //addEntry: (entryId: number) => Promise<any>;
  handleModalClose: () => void;
  modalOpen: boolean;
}

export const FileUploadModal: FunctionComponent<FileUploadModalProps> = (props) => {
    //main modal setup
    const handleUpload = props.handleUpload;
    const handleModalClose = props.handleModalClose;


    const initialVals = {
        fileOne: new File([], ''),
    }

    const readAsBytes = async (file: File) => {
        const fileByteArray = [] as number[]
        const buffer = await file.arrayBuffer();
        const readFile = new Uint8Array(buffer)
        for (let i = 0; i < readFile.length; i++) {
            fileByteArray.push(readFile[i]);
        }
        return fileByteArray
    };

    const multiFileSubmit = async (files: File[]) =>{
        const newImgIds: number[] = []
        await Promise.all(files.map(async (file)=>{
            const response = await createImageStore({
                id: undefined,
                filename: file.name,
                image: await readAsBytes(file)
            })
            if(response.data.id)
                newImgIds.push(response.data.id)
        }))
        return newImgIds
    }
    const singleFileSubmit = async (file: File)=>{
        const response = await createImageStore({
            id: undefined,
            filename: file.name,
            image: await readAsBytes(file)
        })
        if(response.data.id)
            return [response.data.id]
        else
            return []
    }

    const handleSubmit = async (vals: typeof initialVals, { setStatus }: FormikHelpers<typeof initialVals>) => {
        let imgIds: number[] = []
        if(vals.fileOne){
            if(Array.isArray(vals.fileOne)){
                // console.log('mutli')
                imgIds = imgIds.concat(await multiFileSubmit(vals.fileOne))
                // console.log(imgIds)
            }
            else{
                // console.log('single')
                imgIds = imgIds.concat(await singleFileSubmit(vals.fileOne))
                // console.log(imgIds)
            }
        }
        handleUpload(imgIds);
        //entry.imageStoreIds = imgIds
        /*
        updateEntry(entry).then(res3 => {
            //console.log(res3.data);
        });
        */


        props.handleModalClose();
    }

    return (
        <React.Fragment>
            <Formik
                initialValues={initialVals}
                onSubmit={handleSubmit}
                //validate={validate}
                //validateOnChange={false}
                //enableReinitialize
            >
                <BForm>
                    <Card>
                        <CardHeader>
                            <BT>Add Attachments</BT>
                        </CardHeader>
                        <CardContent>
                            <BT>Add Attachments</BT>

                            <BFileUpload name="fileOne" multiple />
                      
                        </CardContent>
                        <CardActions className={'space-between'}>
                            <Button id='cancel-button' onClick={handleModalClose}>Cancel</Button>
                            <Button id='create-button' type="submit" >Add Files</Button>
                        </CardActions>
                    </Card>
                </BForm>
            </Formik>
        </React.Fragment>
    );
};
