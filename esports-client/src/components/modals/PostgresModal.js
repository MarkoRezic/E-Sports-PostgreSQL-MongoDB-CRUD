import { useState, useEffect } from 'react'
import '../../css/Modal.css'
import '../../css/Table.css'
import axios from 'axios'

export const PostgresModal = (params) => {
    const { table_name, modalData, closeModal } = params
    const [foreignValues, setForeignValues] = useState(null);

    let keys = modalData.keys
    const id_original = modalData.mode === 'INSERT' ? null : modalData.data[keys[0]]

    const getForeignValues = () => {
        axios.get('http://localhost:3001/postgres/foreign_values/' + table_name).then((response) => {
            setForeignValues(response.data.result.rows[0] ?? [])
            console.log(response.data.result.rows[0])
            console.log(params)
            keys.sort((x, y) => { return x === `id_${table_name}` ? -1 : y === `id_${table_name}` ? 1 : 0; });
            if (modalData.mode === 'INSERT') {
                keys.shift()
            }
        })
    }

    useEffect(() => {
        getForeignValues()
        return () => {
        }
    }, [])

    const insertData = () => {
        let body = {}
        for (const key of keys) {
            if (key.endsWith('_naziv') || key.endsWith('_ime') || key.endsWith('_ime_prezime')) continue;
            body[key] = document.getElementById(key).value === '-1' ? null : document.getElementById(key).value
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
            if (key.endsWith('_naziv') || key.endsWith('_ime') || key.endsWith('_ime_prezime')) continue;
            body[key] = document.getElementById(key).value === '-1' ? null : document.getElementById(key).value
        }
        axios.put('http://localhost:3001/postgres/table/' + table_name + '/' + id_original, body).then((response) => {
            console.log(response)
            if (response.data.error === 0) {
                closeModal(true)
            }
        })
    }

    return (
        <div className="modal-container postgres">
            <div className='modal-cover' onClick={closeModal}></div>
            <div className='modal'>

                <h3 className='modal-title'>{modalData.mode === 'INSERT' ? 'Dodaj' : 'Uredi'} {table_name}</h3>
                {
                    foreignValues == null ?
                        <svg className="loader postgres loader-relative" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="30"></circle>
                        </svg>
                        :
                        keys.map((key, index) =>
                            <div className='input-row' key={index}>
                                {
                                    key.startsWith('id_') && !key.endsWith(table_name) && !key.endsWith('partija') ? null
                                        : <label htmlFor={key}>{key}</label>
                                }
                                {
                                    key === 'id_partija' && table_name === 'partija'
                                        ? <input id={key} name={key} type='text' disabled={key === `id_${table_name}`} defaultValue={modalData.data ? modalData.data[key] : ''} placeholder={key} />
                                        : key.startsWith('id_') && !key.endsWith(table_name) && !key.endsWith('partija')
                                            ? <input id={key} name={key} type='text' hidden defaultValue={modalData.data ? modalData.data[key] : ''} placeholder={key} />
                                            : (key.endsWith('_naziv') || key.endsWith('_ime') || key.endsWith('_ime_prezime') || key === 'id_partija')
                                                ? <select id={key} name={key} defaultValue={modalData.data != null ? modalData.data['id_' + key.replace(/_naziv$|_ime$|_ime_prezime$|^id_/, '')] : -1} onChange={(e) => {
                                                    document.getElementById('id_' + key.replace(/_naziv$|_ime$|_ime_prezime$|^id_/, '')).value = e.target.value
                                                    if (key === 'tim1_naziv') {
                                                        if (document.getElementById('id_tim2').value === e.target.value) {
                                                            document.getElementById('id_tim2').value = -1
                                                            document.getElementById('tim2_naziv').value = -1
                                                        }
                                                    }
                                                    else if (key === 'tim2_naziv') {
                                                        if (document.getElementById('id_tim1').value === e.target.value) {
                                                            document.getElementById('id_tim1').value = -1
                                                            document.getElementById('tim1_naziv').value = -1
                                                        }
                                                    }
                                                    if (key.startsWith('tim') && document.getElementById('id_tim_pobjednik').value !== document.getElementById('id_tim1').value && document.getElementById('id_tim_pobjednik').value !== document.getElementById('id_tim2').value) {
                                                        document.getElementById('id_tim_pobjednik').value = -1
                                                        document.getElementById('tim_pobjednik_naziv').value = -1
                                                    }
                                                }}>
                                                    <option value={-1} disabled>{key}...</option>
                                                    {
                                                        foreignValues[key.replace(/_naziv$|_ime$|_ime_prezime$|^id_/, '')].map((id_value, index) =>
                                                            <option value={Object.keys(id_value)[0]} key={index}>{id_value[Object.keys(id_value)[0]]}</option>
                                                        )
                                                    }
                                                </select>
                                                : <input id={key} name={key} type='text' disabled={key === `id_${table_name}`} defaultValue={modalData.data ? modalData.data[key] : ''} placeholder={key} />
                                }
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