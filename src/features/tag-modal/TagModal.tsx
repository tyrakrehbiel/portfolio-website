import React, { FunctionComponent } from 'react';
import { getUserTags } from '../../axios/tags';
import { Tag } from '../../@types/index';

import { BForm, BSelect, BOption, BSubmit } from 'mui-bueno';
import { Chip } from '@material-ui/core';
import { Formik } from 'formik';

export const TagModal: FunctionComponent = () => {
    const [tags, setTags] = React.useState<Tag[]>([]);

    const defaultTagColor = 'white';

    // TODO: add initial values 
    // the form will be populated with
    const initialVals = {
        Tags: []
        // ...
    }

    /**
     * creates list of values to be added to the tags field
     * @returns list for tags options
     */
    const createTagList = () => {
        const allTags: BOption<string>[] = [];
        tags.map(tag => {
            if (tag.id) {
                allTags.push({ value: tag.id.toString(), label: tag.name });
            }
        });
        return allTags;
    }

    /**
     * helps add color to chosen tags in form
     * @param id id of tag to be retreived
     * @returns color of chip of chosen tag
     */
    const getTagColorById = (id: number | undefined) => {
        if (id) {
            const chosenTag = tags.find(tag => tag.id === id);
            if (chosenTag) {
                return chosenTag.color;
            }
        }
        return defaultTagColor;
    }

    const tagOptions: BOption<string>[] = createTagList();

    React.useEffect(() => {
        //TODO: how to get userId? Redux?
        getUserTags(1).then(res => {
            setTags(res.data);
        })

        // TODO: get other data for form if necessary

    }, []);

    const handleSubmit = (data: any) => {
        console.log(data.Tags.map(Number));
        // TODO: submit data along with other info
        // fields are in the format data.nameOfField
    }

    const validate = () => {
        console.log('validate');
        //TODO: if any of the input needs validation
        // an example of validate: 
        // https://gitlab.com/technology-innovations-lab/open-source/mui-bueno/-/blob/development/docs/tag-references/form/BForm.md
    }

    //TODO: add fields in the <BForm></BForm> tags
    return (
        <React.Fragment>
            <div id='wrapper' >
                <div>
                    <Formik
                        initialValues={initialVals}
                        onSubmit={handleSubmit}
                        validate={validate}
                        validateOnChange={false}
                    >
                        <BForm>
                            <BSelect
                                name='Tags'
                                multiple
                                options={tagOptions}
                                placeholder='Select Tags'
                                renderValue={selected => (
                                    <div>
                                        {(selected as number[]).map(value => {
                                            const option = tagOptions.find(op => op.value === tagOptions[value].value);
                                            return (
                                                option &&
                                                <Chip
                                                    key={`tag-${option.value}`}
                                                    label={option.label}
                                                    style={
                                                        { backgroundColor: getTagColorById(Number(option.value)) }
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            >
                            </BSelect>
                            <BSubmit> Submit </BSubmit>
                        </BForm>
                    </Formik>

                </div>
            </div>
        </React.Fragment>
    );
};