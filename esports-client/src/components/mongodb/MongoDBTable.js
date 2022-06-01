import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import '../../css/Table.css'
import axios from 'axios'

export const MongoDBTable = () => {
    const { collection_name } = useParams();
    const [data, setData] = useState(null)
    const [columns, setColumns] = useState(null)

    useEffect(() => {
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
                    : <table className='mongodb'>
                        <thead>
                            <tr>
                                {columns.map((column, index) => <th key={index}>{column}</th>)}
                                <th>ACTIONS <i className="action fas fa-plus"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, indexRow) =>
                                <tr key={indexRow}>
                                    {columns.map((column, indexColumn) => <td key={indexColumn}>{JSON.stringify(row[column])}</td>)}
                                    <td className='action-row'>
                                        <i className="action fas fa-plus"></i>
                                        <i className="action fas fa-pencil-alt"></i>
                                        <i className="action fas fa-trash-alt"></i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
            }
        </div>
    )
}