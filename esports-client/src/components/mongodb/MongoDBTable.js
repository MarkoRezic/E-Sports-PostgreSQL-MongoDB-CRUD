import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import '../../css/Table.css'
import axios from 'axios'
import { MongoDBModal } from '../modals/MongoDBModal';
import {
    JsonTree,
    ADD_DELTA_TYPE,
    REMOVE_DELTA_TYPE,
    UPDATE_DELTA_TYPE,
    DATA_TYPES,
    INPUT_USAGE_TYPES,
} from 'react-editable-json-tree'

export const MongoDBTable = () => {
    const { collection_name } = useParams();
    const [data, setData] = useState(null)
    const [columns, setColumns] = useState(null)
    const [modalData, setModalData] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const getTableData = () => {
        axios.get('http://localhost:3001/mongo/collection/' + collection_name).then((response) => {
            console.log(response)
            let tempColumns = []
            for (const row of response.data.results) {
                for (const key of Object.keys(row)) {
                    if (!tempColumns.includes(key)) {
                        tempColumns.push(key)
                    }
                }
            }
            setColumns(tempColumns)
            setData(response.data.results)
        })
    }

    useEffect(() => {
        getTableData()
        return () => {
        }
    }, [collection_name])

    const openInsert = (data) => {
        setModalData({ data: data, mode: 'INSERT' })
        setShowModal(true)
    }

    const openUpdate = (data) => {
        setModalData({ data: data, mode: 'UPDATE' })
        setShowModal(true)
    }

    const deleteRow = (data) => {
        console.log(data)
        axios.delete('http://localhost:3001/mongo/collection/' + collection_name + '/' + data["_id"]).then((response) => {
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

    useEffect(() => {
        getTableData()
        return () => {
        }
    }, [collection_name])

    return (
        <div className='table-wrapper'>
            {
                data === null || columns === null ?
                    <svg className="loader mongodb" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="30"></circle>
                    </svg>
                    :
                    <table className='mongodb'>
                        <thead>
                            <tr>
                                {columns.map((column, index) => <th key={index}>{column}</th>)}
                                <th>ACTIONS <i className="action fas fa-plus" onClick={() => { openInsert({}) }}></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, indexRow) =>
                                <tr key={indexRow}>
                                    {columns.map((column, indexColumn) => <td key={indexColumn}>{
                                        ((typeof row[column] === 'object' && row[column] !== null) || row[column] instanceof Array)
                                            ? <JsonTree data={row[column]} readOnly rootName={column} isCollapsed={(keyPath, deep) => (false)} />
                                            : JSON.stringify(row[column])
                                    }</td>)}
                                    <td className='action-row'>
                                        <i className="action fas fa-plus" onClick={() => { openInsert(row) }}></i>
                                        <i className="action fas fa-pencil-alt" onClick={() => { openUpdate(row) }}></i>
                                        <i className="action fas fa-trash-alt" onClick={() => { deleteRow(row) }}></i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
            }
            {
                showModal ?
                    <MongoDBModal collection_name={collection_name} modalData={modalData} closeModal={closeModal} />
                    : null
            }
        </div>
    )
}