import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import '../../css/Table.css'
import axios from 'axios'
import { Modal } from '../modals/Modal';

export const PostgresTable = () => {
    const { table_name } = useParams();
    const [data, setData] = useState(null)
    const [modalData, setModalData] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const getTableData = () => {
        axios.get('http://localhost:3001/postgres/table/' + table_name).then((response) => {
            console.log(response)
            setData(response.data.result)
        })
    }

    useEffect(() => {
        getTableData()
        return () => {
        }
    }, [table_name])

    const openInsert = (data, keys) => {
        setModalData({ data: data, keys: keys.map((key) => key.name), mode: 'INSERT' })
        setShowModal(true)
    }

    const openUpdate = (data, keys) => {
        setModalData({ data: data, keys: keys.map((key) => key.name), mode: 'UPDATE' })
        setShowModal(true)
    }

    const deleteRow = (data) => {
        axios.delete('http://localhost:3001/postgres/table/' + table_name + '/' + data[Object.keys(data)[0]]).then((response) => {
            console.log(response)
            getTableData()
        })
    }

    const closeModal = (refresh = false) => {
        setModalData(null)
        setShowModal(false)

        if (refresh) {
            getTableData()
        }
    }

    return (
        <div className='table-wrapper'>
            {
                data === null ?
                    <svg className="loader progress" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="30"></circle>
                    </svg>
                    : <table className='postgres'>
                        <thead>
                            <tr>
                                {data.fields.map((field, index) => <th key={index}>{field.name}</th>)}
                                <th>ACTIONS <i className="action fas fa-plus" onClick={() => { openInsert(null, data.fields) }}></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, indexRow) =>
                                <tr key={indexRow}>
                                    {data.fields.map((field, indexField) => <td key={indexField}>{row[field.name]}</td>)}
                                    <td className='action-row'>
                                        <i className="action fas fa-plus" onClick={() => { openInsert(row, data.fields) }}></i>
                                        <i className="action fas fa-pencil-alt" onClick={() => { openUpdate(row, data.fields) }}></i>
                                        <i className="action fas fa-trash-alt" onClick={() => { deleteRow(row) }}></i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
            }
            {
                showModal ?
                    <Modal table_name={table_name} modalData={modalData} closeModal={closeModal} />
                    : null
            }
        </div>
    )
}