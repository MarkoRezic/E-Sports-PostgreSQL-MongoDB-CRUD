import { useState, useEffect } from 'react'
import '../../css/Modal.css'
import axios from 'axios'

export const Modal = (params) => {
    const { table_name, modalData, closeModal } = params

    console.log(params)
    let keys = modalData.keys
    keys.sort((x, y) => { return x === `id_${table_name}` ? -1 : y === `id_${table_name}` ? 1 : 0; });
    const id_original = modalData.mode === 'INSERT' ? null : modalData.data[keys[0]]
    if (modalData.mode === 'INSERT') {
        keys.shift()
    }

    const insertData = () => {
        let body = {}
        for (const key of keys) {
            body[key] = document.getElementById(key).value
        }
        axios.post('http://localhost:3001/postgres/table/' + table_name, body).then((response) => {
            console.log(response)
            if (response.data.error === 0) {
                closeModal(true)
            }
        })
    }

    const updateData = () => {
        let body = {}
        for (const key of keys) {
            body[key] = document.getElementById(key).value
        }
        axios.put('http://localhost:3001/postgres/table/' + table_name + '/' + id_original, body).then((response) => {
            console.log(response)
            if (response.data.error === 0) {
                closeModal(true)
            }
        })
    }

    return (
        <div className="modal-container">
            <div className='modal-cover' onClick={closeModal}></div>
            <div className='modal'>

                <h3 className='modal-title'>{modalData.mode === 'INSERT' ? 'Dodaj' : 'Uredi'} {table_name}</h3>
                {
                    keys.map((key, index) =>
                        <div className='input-row' key={index}>
                            <label htmlFor={key}>{key}</label>
                            <input id={key} name={key} type='text' disabled={key === `id_${table_name}`} defaultValue={modalData.data ? modalData.data[key] : ''} placeholder={key} />
                        </div>
                    )
                }
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