import { useState, useEffect } from 'react'
import '../../css/Modal.css'
import '../../css/Table.css'
import axios from 'axios'
import {
    JsonTree,
    ADD_DELTA_TYPE,
    REMOVE_DELTA_TYPE,
    UPDATE_DELTA_TYPE,
    DATA_TYPES,
    INPUT_USAGE_TYPES,
} from 'react-editable-json-tree'

export const MongoDBModal = (params) => {
    const { collection_name, modalData, closeModal } = params
    const id_original = modalData.mode === 'INSERT' ? null : modalData.data["_id"]
    const [data, setData] = useState((() => {
        let dataWithoutID = modalData.data
        delete dataWithoutID["_id"]
        return dataWithoutID
    })())


    const insertData = () => {
        let body = data
        axios.post('http://localhost:3001/mongo/collection/' + collection_name, body).then((response) => {
            console.log(response)
            if (response.data.error === 0) {
                closeModal(true)
            }
        })
    }

    const updateData = () => {
        let body = data
        axios.put('http://localhost:3001/mongo/collection/' + collection_name + '/' + id_original, body).then((response) => {
            console.log(response)
            if (response.data.error === 0) {
                closeModal(true)
            }
        })
    }

    return (
        <div className="modal-container mongodb">
            <div className='modal-cover' onClick={closeModal}></div>
            <div className='modal'>

                <h3 className='modal-title'>{modalData.mode === 'INSERT' ? 'Dodaj' : 'Uredi'} {collection_name.replace(/s$/, '')}</h3>
                <JsonTree
                    data={data}
                    rootName={collection_name.replace(/s$/, '')}
                    isCollapsed={(keyPath, deep) => (false)}
                    onFullyUpdate={(newData) => { console.log(newData); setData(newData) }}
                    addButtonElement={<button>Dodaj atribut</button>}
                    cancelButtonElement={<button className='close-btn'>Poništi</button>}
                    editButtonElement={<button>Uredi atribut</button>}
                    minusMenuElement={<span><i className="delete-attribute fas fa-trash-alt"></i></span>}
                    plusMenuElement={<span><i className="add-attribute fas fa-plus"></i></span>}
                />
                <div className='button-row'>
                    <button className='close-btn' onClick={closeModal}>Zatvori</button>
                    {
                        modalData.mode === 'INSERT' ?
                            <button className='insert-btn' onClick={insertData}>Dodaj</button>
                            : <button className='update-btn' onClick={updateData}>Uredi</button>
                    }
                </div>
            </div>
        </div>
    )
}